import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user with email and password
   */
  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create user with default student role (can be changed by admin later)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: 'student', // Default role, admin can change later
        status: 'active',
      },
    });

    // Generate tokens
    return this.generateTokens(user);
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses a different login method');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    return this.generateTokens(user, userAgent, ipAddress);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Find refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (storedToken.user.status !== 'active') {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Revoke old refresh token (rotation for security)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(
      storedToken.user,
      storedToken.userAgent ?? undefined,
      storedToken.ipAddress ?? undefined,
    );
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Logout from all devices - revoke all refresh tokens for user
   */
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Unable to change password');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens (force re-login on all devices)
    await this.logoutAll(userId);
  }

  /**
   * Get current user from token
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        status: true,
        profile: {
          select: {
            photoUrl: true,
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return user;
  }

  /**
   * Validate JWT payload and return user info
   */
  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        status: true,
      },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: { id: string; email: string; name: string; role: string; tenantId: string | null },
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        userAgent: userAgent?.substring(0, 500), // Limit length
        ipAddress: ipAddress?.substring(0, 45), // IPv6 max length
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Cleanup expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });

    return result.count;
  }
}
