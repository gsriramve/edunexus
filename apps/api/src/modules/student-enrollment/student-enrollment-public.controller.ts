import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { StudentEnrollmentService } from './student-enrollment.service';
import {
  UpdateProfileDto,
  StudentSignupDto,
} from './dto/enrollment.dto';

/**
 * Public Controller for Student Enrollment
 * Token-based authentication - no login required
 * Used by students to complete their enrollment via email link
 */
@Controller('student-enrollment')
export class StudentEnrollmentPublicController {
  constructor(private readonly enrollmentService: StudentEnrollmentService) {}

  /**
   * Verify enrollment token
   * Returns enrollment details if token is valid
   * Used by frontend to show the enrollment form
   */
  @Get('verify/:token')
  async verifyToken(@Param('token') token: string) {
    return this.enrollmentService.verifyToken(token);
  }

  /**
   * Student signs up with Clerk and links to enrollment
   * Called after student creates their Clerk account
   */
  @Post('signup/:token')
  async signup(
    @Param('token') token: string,
    @Body() dto: StudentSignupDto,
  ) {
    return this.enrollmentService.studentSignup(token, dto);
  }

  /**
   * Update student profile during onboarding
   * Student fills in personal details, academic history, uploads documents
   */
  @Patch('profile/:token')
  async updateProfile(
    @Param('token') token: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.enrollmentService.updateProfile(token, dto);
  }

  /**
   * Submit enrollment for review
   * After student completes profile, they submit for admin review
   */
  @Post('submit/:token')
  async submitForReview(@Param('token') token: string) {
    return this.enrollmentService.submitForReview(token);
  }
}
