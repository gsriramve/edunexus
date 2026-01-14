import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AlumniService } from './alumni.service';
import { MentorshipService } from './mentorship.service';
import { EventsService } from './events.service';
import { ContributionsService } from './contributions.service';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateAlumniProfileDto,
  UpdateAlumniProfileDto,
  ApproveAlumniDto,
  QueryAlumniDto,
  CreateEmploymentDto,
  UpdateEmploymentDto,
  RequestMentorshipDto,
  RespondMentorshipDto,
  UpdateMentorshipDto,
  RateMentorshipDto,
  QueryMentorshipsDto,
  CreateContributionDto,
  UpdateContributionDto,
  ProcessContributionDto,
  QueryContributionsDto,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  ApproveTestimonialDto,
  QueryTestimonialsDto,
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
  EventFeedbackDto,
  MarkAttendanceDto,
} from './dto/alumni.dto';

@Controller('alumni')
@UseGuards(RolesGuard)
export class AlumniController {
  constructor(
    private readonly alumniService: AlumniService,
    private readonly mentorshipService: MentorshipService,
    private readonly eventsService: EventsService,
    private readonly contributionsService: ContributionsService,
  ) {}

  // ============ PROFILE ENDPOINTS ============

  /**
   * Register as alumni (self-registration)
   */
  @Post('register')
  @Roles('alumni')
  async register(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateAlumniProfileDto,
  ) {
    return this.alumniService.createProfile(tenantId, dto, userId);
  }

  /**
   * Get alumni directory (public, approved profiles only)
   */
  @Get('directory')
  async getDirectory(
    @TenantId() tenantId: string,
    @Query() query: QueryAlumniDto,
  ) {
    return this.alumniService.getDirectory(tenantId, query);
  }

  /**
   * Get directory filters
   */
  @Get('directory/filters')
  async getDirectoryFilters(@TenantId() tenantId: string) {
    return this.alumniService.getDirectoryFilters(tenantId);
  }

  /**
   * Get mentors available for mentorship
   */
  @Get('mentors')
  async getMentors(
    @TenantId() tenantId: string,
    @Query() query: QueryAlumniDto,
  ) {
    return this.alumniService.getMentors(tenantId, query);
  }

  /**
   * Get alumni profile by ID
   */
  @Get('profiles/:id')
  async getProfile(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.alumniService.getProfile(tenantId, id);
  }

  /**
   * Get my alumni profile
   */
  @Get('my-profile')
  @Roles('alumni')
  async getMyProfile(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.alumniService.getProfileByUserId(tenantId, userId);
  }

  /**
   * Update my alumni profile
   */
  @Put('my-profile')
  @Roles('alumni')
  async updateMyProfile(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateAlumniProfileDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.alumniService.updateProfile(tenantId, profile.id, dto);
  }

  /**
   * Upload profile photo (alumni)
   */
  @Post('my-profile/photo')
  @Roles('alumni')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadMyPhoto(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.alumniService.uploadProfilePhoto(tenantId, profile.id, file);
  }

  /**
   * Query all profiles (admin)
   */
  @Get('profiles')
  @Roles('principal', 'admin_staff')
  async queryProfiles(
    @TenantId() tenantId: string,
    @Query() query: QueryAlumniDto,
  ) {
    return this.alumniService.queryProfiles(tenantId, query);
  }

  /**
   * Approve/reject alumni registration
   */
  @Put('profiles/:id/approve')
  @Roles('principal', 'admin_staff')
  async approveProfile(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveAlumniDto,
  ) {
    return this.alumniService.approveProfile(tenantId, id, userId, dto);
  }

  /**
   * Convert student to alumni
   */
  @Post('convert-student/:studentId')
  @Roles('principal', 'admin_staff')
  async convertStudent(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Body() dto: { graduationYear: number; finalCgpa?: number },
  ) {
    return this.alumniService.convertStudentToAlumni(
      tenantId,
      studentId,
      dto.graduationYear,
      dto.finalCgpa,
    );
  }

  /**
   * Get alumni stats
   */
  @Get('stats')
  @Roles('principal', 'admin_staff', 'hod')
  async getStats(@TenantId() tenantId: string) {
    return this.alumniService.getStats(tenantId);
  }

  // ============ EMPLOYMENT ENDPOINTS ============

  /**
   * Add employment (alumni's own)
   */
  @Post('my-employment')
  @Roles('alumni')
  async addMyEmployment(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateEmploymentDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.alumniService.addEmployment(tenantId, profile.id, dto);
  }

  /**
   * Update employment
   */
  @Put('employment/:id')
  @Roles('alumni')
  async updateEmployment(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmploymentDto,
  ) {
    return this.alumniService.updateEmployment(tenantId, id, dto);
  }

  /**
   * Delete employment
   */
  @Delete('employment/:id')
  @Roles('alumni')
  async deleteEmployment(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.alumniService.deleteEmployment(tenantId, id);
  }

  /**
   * Verify employment (admin)
   */
  @Put('employment/:id/verify')
  @Roles('principal', 'admin_staff')
  async verifyEmployment(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.alumniService.verifyEmployment(tenantId, id, userId);
  }

  // ============ MENTORSHIP ENDPOINTS ============

  /**
   * Request mentorship (student)
   */
  @Post('mentorships/request')
  @Roles('student')
  async requestMentorship(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: RequestMentorshipDto,
  ) {
    // Get student ID from user
    const student = await this.mentorshipService['prisma'].student.findFirst({
      where: { userId, tenantId },
    });
    if (!student) throw new Error('Student not found');
    return this.mentorshipService.requestMentorship(tenantId, student.id, dto);
  }

  /**
   * Respond to mentorship request (alumni)
   */
  @Put('mentorships/:id/respond')
  @Roles('alumni')
  async respondToMentorship(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: RespondMentorshipDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.mentorshipService.respondToRequest(tenantId, id, profile.id, dto);
  }

  /**
   * Get my mentorships as student
   */
  @Get('my-mentorships/student')
  @Roles('student')
  async getMyMentorshipsAsStudent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const student = await this.mentorshipService['prisma'].student.findFirst({
      where: { userId, tenantId },
    });
    if (!student) throw new Error('Student not found');
    return this.mentorshipService.getMyMentorshipsAsStudent(tenantId, student.id);
  }

  /**
   * Get my mentorships as alumni
   */
  @Get('my-mentorships/alumni')
  @Roles('alumni')
  async getMyMentorshipsAsAlumni(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.mentorshipService.getMyMentorshipsAsAlumni(tenantId, profile.id);
  }

  /**
   * Get pending mentorship requests (alumni)
   */
  @Get('my-mentorships/pending')
  @Roles('alumni')
  async getPendingRequests(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.mentorshipService.getPendingRequestsForAlumni(tenantId, profile.id);
  }

  /**
   * Get mentorship by ID
   */
  @Get('mentorships/:id')
  async getMentorship(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.mentorshipService.getMentorship(tenantId, id);
  }

  /**
   * Update mentorship
   */
  @Put('mentorships/:id')
  @Roles('alumni', 'principal', 'admin_staff')
  async updateMentorship(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMentorshipDto,
  ) {
    return this.mentorshipService.updateMentorship(tenantId, id, dto);
  }

  /**
   * Log meeting (increment count)
   */
  @Post('mentorships/:id/meeting')
  @Roles('alumni')
  async logMeeting(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.mentorshipService.incrementMeetings(tenantId, id);
  }

  /**
   * Rate mentorship (student)
   */
  @Post('mentorships/:id/rate/student')
  @Roles('student')
  async rateMentorshipAsStudent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: RateMentorshipDto,
  ) {
    const student = await this.mentorshipService['prisma'].student.findFirst({
      where: { userId, tenantId },
    });
    if (!student) throw new Error('Student not found');
    return this.mentorshipService.rateByStudent(tenantId, id, student.id, dto);
  }

  /**
   * Rate mentorship (alumni)
   */
  @Post('mentorships/:id/rate/alumni')
  @Roles('alumni')
  async rateMentorshipAsAlumni(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: RateMentorshipDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.mentorshipService.rateByAlumni(tenantId, id, profile.id, dto);
  }

  /**
   * Query mentorships (admin)
   */
  @Get('mentorships')
  @Roles('principal', 'admin_staff', 'hod')
  async queryMentorships(
    @TenantId() tenantId: string,
    @Query() query: QueryMentorshipsDto,
  ) {
    return this.mentorshipService.queryMentorships(tenantId, query);
  }

  /**
   * Get my mentor stats
   */
  @Get('my-mentor-stats')
  @Roles('alumni')
  async getMyMentorStats(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.mentorshipService.getMentorStats(tenantId, profile.id);
  }

  /**
   * Get overall mentorship stats
   */
  @Get('mentorship-stats')
  @Roles('principal', 'admin_staff')
  async getMentorshipStats(@TenantId() tenantId: string) {
    return this.mentorshipService.getOverallMentorshipStats(tenantId);
  }

  // ============ CONTRIBUTION ENDPOINTS ============

  /**
   * Create contribution (alumni)
   */
  @Post('my-contributions')
  @Roles('alumni')
  async createContribution(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateContributionDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.contributionsService.createContribution(tenantId, profile.id, dto);
  }

  /**
   * Get my contributions (alumni)
   */
  @Get('my-contributions')
  @Roles('alumni')
  async getMyContributions(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.contributionsService.getMyContributions(tenantId, profile.id);
  }

  /**
   * Update contribution (alumni)
   */
  @Put('contributions/:id')
  @Roles('alumni')
  async updateContribution(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContributionDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.contributionsService.updateContribution(tenantId, id, profile.id, dto);
  }

  /**
   * Query contributions (admin)
   */
  @Get('contributions')
  @Roles('principal', 'admin_staff')
  async queryContributions(
    @TenantId() tenantId: string,
    @Query() query: QueryContributionsDto,
  ) {
    return this.contributionsService.queryContributions(tenantId, query);
  }

  /**
   * Get contribution by ID
   */
  @Get('contributions/:id')
  async getContribution(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contributionsService.getContribution(tenantId, id);
  }

  /**
   * Process contribution (admin)
   */
  @Put('contributions/:id/process')
  @Roles('principal', 'admin_staff')
  async processContribution(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: ProcessContributionDto,
  ) {
    return this.contributionsService.processContribution(tenantId, id, userId, dto);
  }

  /**
   * Get public contributions (wall of fame)
   */
  @Get('contributions/public')
  async getPublicContributions(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.contributionsService.getPublicContributions(tenantId, limit);
  }

  /**
   * Get contribution stats
   */
  @Get('contribution-stats')
  @Roles('principal', 'admin_staff')
  async getContributionStats(@TenantId() tenantId: string) {
    return this.contributionsService.getContributionStats(tenantId);
  }

  /**
   * Get top contributors
   */
  @Get('top-contributors')
  async getTopContributors(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.contributionsService.getTopContributors(tenantId, limit);
  }

  // ============ TESTIMONIAL ENDPOINTS ============

  /**
   * Create testimonial (alumni)
   */
  @Post('my-testimonials')
  @Roles('alumni')
  async createTestimonial(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateTestimonialDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.alumniService.createTestimonial(tenantId, profile.id, dto);
  }

  /**
   * Update testimonial (alumni)
   */
  @Put('testimonials/:id')
  @Roles('alumni')
  async updateTestimonial(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.alumniService.updateTestimonial(tenantId, id, profile.id, dto);
  }

  /**
   * Delete testimonial (alumni or admin)
   */
  @Delete('testimonials/:id')
  @Roles('alumni', 'principal', 'admin_staff')
  async deleteTestimonial(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    // Try to get alumni profile - if alumni, they can only delete their own
    try {
      const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
      return this.alumniService.deleteTestimonial(tenantId, id, profile.id);
    } catch {
      // Admin can delete any
      return this.alumniService.deleteTestimonial(tenantId, id);
    }
  }

  /**
   * Query testimonials (admin)
   */
  @Get('testimonials')
  @Roles('principal', 'admin_staff')
  async queryTestimonials(
    @TenantId() tenantId: string,
    @Query() query: QueryTestimonialsDto,
  ) {
    return this.alumniService.queryTestimonials(tenantId, query);
  }

  /**
   * Get public testimonials
   */
  @Get('testimonials/public')
  async getPublicTestimonials(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.alumniService.getPublicTestimonials(tenantId, limit);
  }

  /**
   * Approve testimonial (admin)
   */
  @Put('testimonials/:id/approve')
  @Roles('principal', 'admin_staff')
  async approveTestimonial(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveTestimonialDto,
  ) {
    return this.alumniService.approveTestimonial(tenantId, id, userId, dto);
  }

  // ============ EVENT ENDPOINTS ============

  /**
   * Create event (admin)
   */
  @Post('events')
  @Roles('principal', 'admin_staff')
  async createEvent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(tenantId, userId, dto);
  }

  /**
   * Update event
   */
  @Put('events/:id')
  @Roles('principal', 'admin_staff')
  async updateEvent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(tenantId, id, dto);
  }

  /**
   * Get event by ID
   */
  @Get('events/:id')
  async getEvent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.getEvent(tenantId, id);
  }

  /**
   * Query events
   */
  @Get('events')
  async queryEvents(
    @TenantId() tenantId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.eventsService.queryEvents(tenantId, query);
  }

  /**
   * Get upcoming events
   */
  @Get('events/upcoming')
  async getUpcomingEvents(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.getUpcomingEvents(tenantId, limit);
  }

  /**
   * Publish event
   */
  @Put('events/:id/publish')
  @Roles('principal', 'admin_staff')
  async publishEvent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.publishEvent(tenantId, id);
  }

  /**
   * Cancel event
   */
  @Put('events/:id/cancel')
  @Roles('principal', 'admin_staff')
  async cancelEvent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.cancelEvent(tenantId, id);
  }

  /**
   * Delete event
   */
  @Delete('events/:id')
  @Roles('principal', 'admin_staff')
  async deleteEvent(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.deleteEvent(tenantId, id);
  }

  /**
   * Register for event (alumni)
   */
  @Post('events/:id/register')
  @Roles('alumni')
  async registerForEvent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.eventsService.registerForEvent(tenantId, id, profile.id);
  }

  /**
   * Cancel event registration (alumni)
   */
  @Delete('events/:id/register')
  @Roles('alumni')
  async cancelRegistration(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.eventsService.cancelRegistration(tenantId, id, profile.id);
  }

  /**
   * Get my event registrations (alumni)
   */
  @Get('my-events')
  @Roles('alumni')
  async getMyRegistrations(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.eventsService.getMyRegistrations(tenantId, profile.id);
  }

  /**
   * Get event attendees (admin)
   */
  @Get('events/:id/attendees')
  @Roles('principal', 'admin_staff')
  async getEventAttendees(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.getEventAttendees(tenantId, id);
  }

  /**
   * Mark attendance (admin)
   */
  @Put('events/:id/attendance')
  @Roles('principal', 'admin_staff')
  async markAttendance(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.eventsService.markAttendance(tenantId, id, dto);
  }

  /**
   * Submit event feedback (alumni)
   */
  @Post('events/:id/feedback')
  @Roles('alumni')
  async submitFeedback(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: EventFeedbackDto,
  ) {
    const profile = await this.alumniService.getProfileByUserId(tenantId, userId);
    return this.eventsService.submitFeedback(tenantId, id, profile.id, dto);
  }

  /**
   * Get event stats
   */
  @Get('events/:id/stats')
  @Roles('principal', 'admin_staff')
  async getEventStats(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventsService.getEventStats(tenantId, id);
  }

  /**
   * Get overall event stats
   */
  @Get('event-stats')
  @Roles('principal', 'admin_staff')
  async getOverallEventStats(@TenantId() tenantId: string) {
    return this.eventsService.getOverallEventStats(tenantId);
  }
}
