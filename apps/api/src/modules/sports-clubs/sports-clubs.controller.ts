import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SportsClubsService } from './sports-clubs.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  TeamQueryDto,
  AddTeamMemberDto,
  UpdateTeamMemberDto,
  CreateClubDto,
  UpdateClubDto,
  ClubQueryDto,
  AddClubMemberDto,
  UpdateClubMemberDto,
  CreateSportsEventDto,
  UpdateSportsEventDto,
  SportsEventQueryDto,
  CreateClubEventDto,
  UpdateClubEventDto,
  ClubEventQueryDto,
  RegisterForEventDto,
  UpdateRegistrationDto,
  CreateAchievementDto,
  UpdateAchievementDto,
  AchievementQueryDto,
  CreateActivityCreditDto,
  ActivityCreditQueryDto,
} from './dto/sports-clubs.dto';

@Controller('sports-clubs')
export class SportsClubsController {
  constructor(private readonly sportsClubsService: SportsClubsService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // SPORTS TEAMS
  // =============================================================================

  @Post('teams')
  createTeam(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateTeamDto,
  ) {
    return this.sportsClubsService.createTeam(this.getTenantId(headers), dto);
  }

  @Get('teams')
  findAllTeams(
    @Headers() headers: Record<string, string>,
    @Query() query: TeamQueryDto,
  ) {
    return this.sportsClubsService.findAllTeams(this.getTenantId(headers), query);
  }

  @Get('teams/:id')
  findTeamById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.findTeamById(this.getTenantId(headers), id);
  }

  @Patch('teams/:id')
  updateTeam(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.sportsClubsService.updateTeam(this.getTenantId(headers), id, dto);
  }

  @Delete('teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTeam(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteTeam(this.getTenantId(headers), id);
  }

  // =============================================================================
  // TEAM MEMBERS
  // =============================================================================

  @Post('teams/members')
  addTeamMember(
    @Headers() headers: Record<string, string>,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.sportsClubsService.addTeamMember(this.getTenantId(headers), dto);
  }

  @Get('teams/:teamId/members')
  getTeamMembers(
    @Headers() headers: Record<string, string>,
    @Param('teamId') teamId: string,
  ) {
    return this.sportsClubsService.getTeamMembers(this.getTenantId(headers), teamId);
  }

  @Patch('teams/members/:id')
  updateTeamMember(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.sportsClubsService.updateTeamMember(this.getTenantId(headers), id, dto);
  }

  @Delete('teams/members/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTeamMember(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.removeTeamMember(this.getTenantId(headers), id);
  }

  // =============================================================================
  // CLUBS
  // =============================================================================

  @Post('clubs')
  createClub(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateClubDto,
  ) {
    return this.sportsClubsService.createClub(this.getTenantId(headers), dto);
  }

  @Get('clubs')
  findAllClubs(
    @Headers() headers: Record<string, string>,
    @Query() query: ClubQueryDto,
  ) {
    return this.sportsClubsService.findAllClubs(this.getTenantId(headers), query);
  }

  @Get('clubs/:id')
  findClubById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.findClubById(this.getTenantId(headers), id);
  }

  @Patch('clubs/:id')
  updateClub(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.sportsClubsService.updateClub(this.getTenantId(headers), id, dto);
  }

  @Delete('clubs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteClub(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteClub(this.getTenantId(headers), id);
  }

  // =============================================================================
  // CLUB MEMBERS
  // =============================================================================

  @Post('clubs/members')
  addClubMember(
    @Headers() headers: Record<string, string>,
    @Body() dto: AddClubMemberDto,
  ) {
    return this.sportsClubsService.addClubMember(this.getTenantId(headers), dto);
  }

  @Get('clubs/:clubId/members')
  getClubMembers(
    @Headers() headers: Record<string, string>,
    @Param('clubId') clubId: string,
  ) {
    return this.sportsClubsService.getClubMembers(this.getTenantId(headers), clubId);
  }

  @Patch('clubs/members/:id')
  updateClubMember(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateClubMemberDto,
  ) {
    return this.sportsClubsService.updateClubMember(this.getTenantId(headers), id, dto);
  }

  @Delete('clubs/members/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeClubMember(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.removeClubMember(this.getTenantId(headers), id);
  }

  // =============================================================================
  // SPORTS EVENTS
  // =============================================================================

  @Post('sports-events')
  createSportsEvent(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateSportsEventDto,
  ) {
    return this.sportsClubsService.createSportsEvent(this.getTenantId(headers), dto);
  }

  @Get('sports-events')
  findAllSportsEvents(
    @Headers() headers: Record<string, string>,
    @Query() query: SportsEventQueryDto,
  ) {
    return this.sportsClubsService.findAllSportsEvents(this.getTenantId(headers), query);
  }

  @Get('sports-events/:id')
  findSportsEventById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.findSportsEventById(this.getTenantId(headers), id);
  }

  @Patch('sports-events/:id')
  updateSportsEvent(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateSportsEventDto,
  ) {
    return this.sportsClubsService.updateSportsEvent(this.getTenantId(headers), id, dto);
  }

  @Delete('sports-events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSportsEvent(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteSportsEvent(this.getTenantId(headers), id);
  }

  // =============================================================================
  // CLUB EVENTS
  // =============================================================================

  @Post('club-events')
  createClubEvent(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateClubEventDto,
  ) {
    return this.sportsClubsService.createClubEvent(this.getTenantId(headers), dto);
  }

  @Get('club-events')
  findAllClubEvents(
    @Headers() headers: Record<string, string>,
    @Query() query: ClubEventQueryDto,
  ) {
    return this.sportsClubsService.findAllClubEvents(this.getTenantId(headers), query);
  }

  @Get('club-events/:id')
  findClubEventById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.findClubEventById(this.getTenantId(headers), id);
  }

  @Patch('club-events/:id')
  updateClubEvent(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateClubEventDto,
  ) {
    return this.sportsClubsService.updateClubEvent(this.getTenantId(headers), id, dto);
  }

  @Delete('club-events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteClubEvent(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteClubEvent(this.getTenantId(headers), id);
  }

  // =============================================================================
  // EVENT REGISTRATIONS
  // =============================================================================

  @Post('registrations')
  registerForEvent(
    @Headers() headers: Record<string, string>,
    @Body() dto: RegisterForEventDto,
  ) {
    return this.sportsClubsService.registerForEvent(this.getTenantId(headers), dto);
  }

  @Patch('registrations/:id')
  updateRegistration(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationDto,
  ) {
    return this.sportsClubsService.updateRegistration(this.getTenantId(headers), id, dto);
  }

  @Post('registrations/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelRegistration(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.cancelRegistration(this.getTenantId(headers), id);
  }

  @Get('registrations/student/:studentId')
  getStudentRegistrations(
    @Headers() headers: Record<string, string>,
    @Param('studentId') studentId: string,
  ) {
    return this.sportsClubsService.getStudentRegistrations(this.getTenantId(headers), studentId);
  }

  // =============================================================================
  // ACHIEVEMENTS
  // =============================================================================

  @Post('achievements')
  createAchievement(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateAchievementDto,
  ) {
    return this.sportsClubsService.createAchievement(this.getTenantId(headers), dto);
  }

  @Get('achievements')
  findAllAchievements(
    @Headers() headers: Record<string, string>,
    @Query() query: AchievementQueryDto,
  ) {
    return this.sportsClubsService.findAllAchievements(this.getTenantId(headers), query);
  }

  @Get('achievements/:id')
  findAchievementById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.findAchievementById(this.getTenantId(headers), id);
  }

  @Patch('achievements/:id')
  updateAchievement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.sportsClubsService.updateAchievement(this.getTenantId(headers), id, dto);
  }

  @Delete('achievements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAchievement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteAchievement(this.getTenantId(headers), id);
  }

  @Post('achievements/:id/verify')
  verifyAchievement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body('verifiedBy') verifiedBy: string,
  ) {
    return this.sportsClubsService.verifyAchievement(this.getTenantId(headers), id, verifiedBy);
  }

  // =============================================================================
  // ACTIVITY CREDITS
  // =============================================================================

  @Post('activity-credits')
  createActivityCredit(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateActivityCreditDto,
  ) {
    return this.sportsClubsService.createActivityCredit(this.getTenantId(headers), dto);
  }

  @Get('activity-credits')
  findAllActivityCredits(
    @Headers() headers: Record<string, string>,
    @Query() query: ActivityCreditQueryDto,
  ) {
    return this.sportsClubsService.findAllActivityCredits(this.getTenantId(headers), query);
  }

  @Get('activity-credits/student/:studentId/summary')
  getStudentCreditsSummary(
    @Headers() headers: Record<string, string>,
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.sportsClubsService.getStudentCreditsSummary(
      this.getTenantId(headers),
      studentId,
      academicYear,
    );
  }

  @Delete('activity-credits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteActivityCredit(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.sportsClubsService.deleteActivityCredit(this.getTenantId(headers), id);
  }

  // =============================================================================
  // STATISTICS & DASHBOARD
  // =============================================================================

  @Get('stats')
  getStats(@Headers() headers: Record<string, string>) {
    return this.sportsClubsService.getStats(this.getTenantId(headers));
  }

  @Get('student/:studentId/activities')
  getStudentActivities(
    @Headers() headers: Record<string, string>,
    @Param('studentId') studentId: string,
  ) {
    return this.sportsClubsService.getStudentActivities(this.getTenantId(headers), studentId);
  }
}
