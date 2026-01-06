import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { AuditAction, AuditCategory, AuditStatus } from './dto/audit.dto';

// Decorator keys
export const AUDIT_ACTION_KEY = 'audit:action';
export const AUDIT_CATEGORY_KEY = 'audit:category';
export const AUDIT_ENTITY_KEY = 'audit:entity';
export const SKIP_AUDIT_KEY = 'audit:skip';

// Decorators for controllers
import { SetMetadata, applyDecorators } from '@nestjs/common';

export const AuditLog = (
  action: AuditAction,
  category: AuditCategory,
  entityType?: string,
) =>
  applyDecorators(
    SetMetadata(AUDIT_ACTION_KEY, action),
    SetMetadata(AUDIT_CATEGORY_KEY, category),
    SetMetadata(AUDIT_ENTITY_KEY, entityType),
  );

export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);

// Route patterns to auto-detect entity types
const ENTITY_PATTERNS: Record<string, string> = {
  '/students': 'Student',
  '/staff': 'Staff',
  '/departments': 'Department',
  '/tenants': 'Tenant',
  '/exams': 'Exam',
  '/exam-results': 'ExamResult',
  '/fees': 'Fee',
  '/payments': 'Payment',
  '/attendance': 'Attendance',
  '/transport': 'Transport',
  '/hostel': 'Hostel',
  '/library': 'Library',
  '/communication': 'Communication',
  '/documents': 'Document',
  '/import-export': 'ImportExport',
  '/sports-clubs': 'SportsClubs',
};

// Routes to skip audit (high frequency, low value)
const SKIP_ROUTES = [
  '/api/audit', // Don't audit the audit system itself
  '/api/health',
  '/api/metrics',
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Check if audit should be skipped
    const skipAudit = this.reflector.get<boolean>(
      SKIP_AUDIT_KEY,
      context.getHandler(),
    );

    if (skipAudit || this.shouldSkipRoute(request.path)) {
      return next.handle();
    }

    // Get tenant ID from header
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return next.handle();
    }

    // Get audit metadata from decorators or auto-detect
    const action = this.getAction(context, request);
    const category = this.getCategory(context, request);
    const entityType = this.getEntityType(context, request);

    // Extract user info (would come from auth middleware in production)
    const userInfo = this.extractUserInfo(request);

    // Extract entity ID from route params
    const entityId = request.params?.id;

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        // Only log mutating operations by default
        if (this.shouldLogAction(action)) {
          this.auditService.log(tenantId, {
            ...userInfo,
            action,
            category,
            entityType,
            entityId,
            entityName: this.extractEntityName(response),
            newValue: this.extractResponseData(action, response),
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            requestMethod: request.method,
            requestPath: request.path,
            requestId: request.headers['x-request-id'] as string,
            status: AuditStatus.SUCCESS,
            duration,
            metadata: {
              query: request.query,
              bodyKeys: request.body ? Object.keys(request.body) : [],
            },
          }).catch(err => this.logger.error('Audit log failed', err));
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log failures
        this.auditService.log(tenantId, {
          ...userInfo,
          action,
          category,
          entityType,
          entityId,
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'],
          requestMethod: request.method,
          requestPath: request.path,
          requestId: request.headers['x-request-id'] as string,
          status: AuditStatus.FAILURE,
          errorMessage: error.message,
          duration,
          metadata: {
            errorName: error.name,
            errorStack: error.stack?.split('\n').slice(0, 3).join('\n'),
          },
        }).catch(err => this.logger.error('Audit log failed', err));

        throw error;
      }),
    );
  }

  private shouldSkipRoute(path: string): boolean {
    return SKIP_ROUTES.some(route => path.startsWith(route));
  }

  private shouldLogAction(action: AuditAction): boolean {
    // Only log mutating actions by default
    // VIEW actions are controlled by settings
    return [
      AuditAction.CREATE,
      AuditAction.UPDATE,
      AuditAction.DELETE,
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.EXPORT,
      AuditAction.IMPORT,
      AuditAction.BULK_CREATE,
      AuditAction.BULK_UPDATE,
      AuditAction.BULK_DELETE,
      AuditAction.APPROVE,
      AuditAction.REJECT,
      AuditAction.PUBLISH,
      AuditAction.ARCHIVE,
    ].includes(action);
  }

  private getAction(context: ExecutionContext, request: Request): AuditAction {
    // First check decorator
    const decoratorAction = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );
    if (decoratorAction) return decoratorAction;

    // Auto-detect from HTTP method
    switch (request.method) {
      case 'POST':
        if (request.path.includes('/bulk')) return AuditAction.BULK_CREATE;
        if (request.path.includes('/login')) return AuditAction.LOGIN;
        if (request.path.includes('/logout')) return AuditAction.LOGOUT;
        if (request.path.includes('/export')) return AuditAction.EXPORT;
        if (request.path.includes('/import')) return AuditAction.IMPORT;
        if (request.path.includes('/publish')) return AuditAction.PUBLISH;
        if (request.path.includes('/archive')) return AuditAction.ARCHIVE;
        if (request.path.includes('/approve')) return AuditAction.APPROVE;
        if (request.path.includes('/reject')) return AuditAction.REJECT;
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        if (request.path.includes('/bulk')) return AuditAction.BULK_UPDATE;
        return AuditAction.UPDATE;
      case 'DELETE':
        if (request.path.includes('/bulk')) return AuditAction.BULK_DELETE;
        return AuditAction.DELETE;
      case 'GET':
        return AuditAction.VIEW;
      default:
        return AuditAction.VIEW;
    }
  }

  private getCategory(context: ExecutionContext, request: Request): AuditCategory {
    // First check decorator
    const decoratorCategory = this.reflector.get<AuditCategory>(
      AUDIT_CATEGORY_KEY,
      context.getHandler(),
    );
    if (decoratorCategory) return decoratorCategory;

    // Auto-detect from path
    const path = request.path.toLowerCase();

    if (path.includes('/auth') || path.includes('/login') || path.includes('/logout')) {
      return AuditCategory.AUTHENTICATION;
    }
    if (path.includes('/student')) return AuditCategory.STUDENT_MANAGEMENT;
    if (path.includes('/staff') || path.includes('/teacher')) return AuditCategory.STAFF_MANAGEMENT;
    if (path.includes('/exam') || path.includes('/result')) return AuditCategory.EXAM;
    if (path.includes('/fee') || path.includes('/payment')) return AuditCategory.FINANCIAL;
    if (path.includes('/attendance')) return AuditCategory.ATTENDANCE;
    if (path.includes('/transport')) return AuditCategory.TRANSPORT;
    if (path.includes('/hostel')) return AuditCategory.HOSTEL;
    if (path.includes('/library')) return AuditCategory.LIBRARY;
    if (path.includes('/communication') || path.includes('/announcement')) return AuditCategory.COMMUNICATION;
    if (path.includes('/document')) return AuditCategory.DOCUMENT;
    if (path.includes('/import') || path.includes('/export')) return AuditCategory.IMPORT_EXPORT;
    if (path.includes('/setting')) return AuditCategory.SETTINGS;
    if (path.includes('/user')) return AuditCategory.USER_MANAGEMENT;

    return AuditCategory.SYSTEM;
  }

  private getEntityType(context: ExecutionContext, request: Request): string | undefined {
    // First check decorator
    const decoratorEntity = this.reflector.get<string>(
      AUDIT_ENTITY_KEY,
      context.getHandler(),
    );
    if (decoratorEntity) return decoratorEntity;

    // Auto-detect from path
    for (const [pattern, entityType] of Object.entries(ENTITY_PATTERNS)) {
      if (request.path.includes(pattern)) {
        return entityType;
      }
    }

    return undefined;
  }

  private extractUserInfo(request: Request): {
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
  } {
    // In production, this would come from the authenticated user
    // For now, check headers or request body
    const user = (request as any).user;

    if (user) {
      return {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
      };
    }

    // Fallback to headers for testing
    return {
      userId: request.headers['x-user-id'] as string,
      userEmail: request.headers['x-user-email'] as string,
      userName: request.headers['x-user-name'] as string,
      userRole: request.headers['x-user-role'] as string,
    };
  }

  private extractEntityName(response: any): string | undefined {
    if (!response) return undefined;

    // Try common name fields
    return response.name || response.title || response.displayName || undefined;
  }

  private extractResponseData(action: AuditAction, response: any): Record<string, any> | undefined {
    if (!response) return undefined;

    // For creates/updates, return the created/updated entity
    if ([AuditAction.CREATE, AuditAction.UPDATE].includes(action)) {
      // Remove sensitive fields
      const data = { ...response };
      delete data.password;
      delete data.passwordHash;
      delete data.token;
      delete data.secret;
      return data;
    }

    return undefined;
  }

  private getClientIp(request: Request): string | undefined {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    }
    return request.ip || request.socket?.remoteAddress;
  }
}
