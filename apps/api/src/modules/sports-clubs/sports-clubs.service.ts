import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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

@Injectable()
export class SportsClubsService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // SPORTS TEAMS
  // =============================================================================

  async createTeam(tenantId: string, dto: CreateTeamDto) {
    // Check for duplicate team name + sport combination
    const existing = await this.prisma.sportsTeam.findFirst({
      where: {
        tenantId,
        name: dto.name,
        sport: dto.sport,
      },
    });

    if (existing) {
      throw new ConflictException(`Team "${dto.name}" already exists for ${dto.sport}`);
    }

    return this.prisma.sportsTeam.create({
      data: {
        tenantId,
        ...dto,
      },
      include: {
        members: {
          include: {
            student: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findAllTeams(tenantId: string, query: TeamQueryDto) {
    const { search, sport, category, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (sport) where.sport = sport;
    if (category) where.category = category;
    if (status) where.status = status;

    const [teams, total] = await Promise.all([
      this.prisma.sportsTeam.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { members: true, events: true },
          },
        },
      }),
      this.prisma.sportsTeam.count({ where }),
    ]);

    return { teams, total, limit, offset };
  }

  async findTeamById(tenantId: string, id: string) {
    const team = await this.prisma.sportsTeam.findFirst({
      where: { id, tenantId },
      include: {
        members: {
          where: { status: 'active' },
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        },
        events: {
          take: 5,
          orderBy: { startDate: 'desc' },
        },
        achievements: {
          take: 5,
          orderBy: { awardedDate: 'desc' },
        },
        _count: {
          select: { members: true, events: true, achievements: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async updateTeam(tenantId: string, id: string, dto: UpdateTeamDto) {
    await this.findTeamById(tenantId, id);

    return this.prisma.sportsTeam.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async deleteTeam(tenantId: string, id: string) {
    await this.findTeamById(tenantId, id);

    return this.prisma.sportsTeam.delete({
      where: { id },
    });
  }

  // =============================================================================
  // TEAM MEMBERS
  // =============================================================================

  async addTeamMember(tenantId: string, dto: AddTeamMemberDto) {
    const { teamId, studentId, ...rest } = dto;

    // Verify team exists
    const team = await this.findTeamById(tenantId, teamId);

    // Check if member count exceeds max
    const memberCount = await this.prisma.teamMember.count({
      where: { teamId, status: 'active' },
    });

    if (team.maxMembers && memberCount >= team.maxMembers) {
      throw new BadRequestException(`Team has reached maximum capacity of ${team.maxMembers} members`);
    }

    // Check if student already a member
    const existing = await this.prisma.teamMember.findFirst({
      where: { teamId, studentId, status: 'active' },
    });

    if (existing) {
      throw new ConflictException('Student is already a member of this team');
    }

    // If role is captain, update team captainId
    if (dto.role === 'captain') {
      await this.prisma.sportsTeam.update({
        where: { id: teamId },
        data: { captainId: studentId },
      });
    }

    return this.prisma.teamMember.create({
      data: {
        tenantId,
        teamId,
        studentId,
        ...rest,
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        team: {
          select: { id: true, name: true, sport: true },
        },
      },
    });
  }

  async updateTeamMember(tenantId: string, id: string, dto: UpdateTeamMemberDto) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id, tenantId },
      include: { team: true },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // If setting as captain, update team captainId
    if (dto.role === 'captain' && member.role !== 'captain') {
      await this.prisma.sportsTeam.update({
        where: { id: member.teamId },
        data: { captainId: member.studentId },
      });
    }

    // If removing member, set leftAt date
    const updateData: any = { ...dto };
    if (dto.status === 'inactive' && member.status === 'active') {
      updateData.leftAt = new Date();
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async removeTeamMember(tenantId: string, id: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id, tenantId },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: {
        status: 'inactive',
        leftAt: new Date(),
      },
    });
  }

  async getTeamMembers(tenantId: string, teamId: string) {
    return this.prisma.teamMember.findMany({
      where: { tenantId, teamId },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { role: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  // =============================================================================
  // CLUBS
  // =============================================================================

  async createClub(tenantId: string, dto: CreateClubDto) {
    // Check for duplicate club code
    const existing = await this.prisma.club.findFirst({
      where: {
        tenantId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(`Club with code "${dto.code}" already exists`);
    }

    return this.prisma.club.create({
      data: {
        tenantId,
        ...dto,
      },
      include: {
        _count: {
          select: { members: true, events: true },
        },
      },
    });
  }

  async findAllClubs(tenantId: string, query: ClubQueryDto) {
    const { search, category, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;

    const [clubs, total] = await Promise.all([
      this.prisma.club.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { members: true, events: true },
          },
        },
      }),
      this.prisma.club.count({ where }),
    ]);

    return { clubs, total, limit, offset };
  }

  async findClubById(tenantId: string, id: string) {
    const club = await this.prisma.club.findFirst({
      where: { id, tenantId },
      include: {
        members: {
          where: { status: 'active' },
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        },
        events: {
          take: 5,
          orderBy: { startDate: 'desc' },
        },
        achievements: {
          take: 5,
          orderBy: { awardedDate: 'desc' },
        },
        _count: {
          select: { members: true, events: true, achievements: true },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async updateClub(tenantId: string, id: string, dto: UpdateClubDto) {
    await this.findClubById(tenantId, id);

    return this.prisma.club.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async deleteClub(tenantId: string, id: string) {
    await this.findClubById(tenantId, id);

    return this.prisma.club.delete({
      where: { id },
    });
  }

  // =============================================================================
  // CLUB MEMBERS
  // =============================================================================

  async addClubMember(tenantId: string, dto: AddClubMemberDto) {
    const { clubId, studentId, ...rest } = dto;

    // Verify club exists
    const club = await this.findClubById(tenantId, clubId);

    // Check if member count exceeds max
    if (club.maxMembers) {
      const memberCount = await this.prisma.clubMember.count({
        where: { clubId, status: 'active' },
      });

      if (memberCount >= club.maxMembers) {
        throw new BadRequestException(`Club has reached maximum capacity of ${club.maxMembers} members`);
      }
    }

    // Check if student already a member
    const existing = await this.prisma.clubMember.findFirst({
      where: { clubId, studentId, status: 'active' },
    });

    if (existing) {
      throw new ConflictException('Student is already a member of this club');
    }

    // If role is president, update club presidentId
    if (dto.role === 'president') {
      await this.prisma.club.update({
        where: { id: clubId },
        data: { presidentId: studentId },
      });
    }

    return this.prisma.clubMember.create({
      data: {
        tenantId,
        clubId,
        studentId,
        ...rest,
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        club: {
          select: { id: true, name: true, code: true, category: true },
        },
      },
    });
  }

  async updateClubMember(tenantId: string, id: string, dto: UpdateClubMemberDto) {
    const member = await this.prisma.clubMember.findFirst({
      where: { id, tenantId },
      include: { club: true },
    });

    if (!member) {
      throw new NotFoundException('Club member not found');
    }

    // If setting as president, update club presidentId
    if (dto.role === 'president' && member.role !== 'president') {
      await this.prisma.club.update({
        where: { id: member.clubId },
        data: { presidentId: member.studentId },
      });
    }

    // If removing member, set leftAt date
    const updateData: any = { ...dto };
    if (dto.status === 'inactive' && member.status === 'active') {
      updateData.leftAt = new Date();
    }

    return this.prisma.clubMember.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async removeClubMember(tenantId: string, id: string) {
    const member = await this.prisma.clubMember.findFirst({
      where: { id, tenantId },
    });

    if (!member) {
      throw new NotFoundException('Club member not found');
    }

    return this.prisma.clubMember.update({
      where: { id },
      data: {
        status: 'inactive',
        leftAt: new Date(),
      },
    });
  }

  async getClubMembers(tenantId: string, clubId: string) {
    return this.prisma.clubMember.findMany({
      where: { tenantId, clubId },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { role: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  // =============================================================================
  // SPORTS EVENTS
  // =============================================================================

  async createSportsEvent(tenantId: string, dto: CreateSportsEventDto) {
    return this.prisma.sportsEvent.create({
      data: {
        tenantId,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        registrationDeadline: dto.registrationDeadline
          ? new Date(dto.registrationDeadline)
          : undefined,
      },
      include: {
        team: {
          select: { id: true, name: true, sport: true },
        },
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async findAllSportsEvents(tenantId: string, query: SportsEventQueryDto) {
    const { search, teamId, sport, type, status, upcomingOnly, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { organizer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (teamId) {
      where.OR = [
        { teamId },
        { homeTeamId: teamId },
        { awayTeamId: teamId },
      ];
    }

    if (sport) where.sport = sport;
    if (type) where.type = type;
    if (status) where.status = status;
    if (upcomingOnly) {
      where.startDate = { gte: new Date() };
      where.status = { in: ['scheduled', 'ongoing'] };
    }

    const [events, total] = await Promise.all([
      this.prisma.sportsEvent.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { startDate: upcomingOnly ? 'asc' : 'desc' },
        include: {
          team: {
            select: { id: true, name: true, sport: true },
          },
          homeTeam: {
            select: { id: true, name: true },
          },
          awayTeam: {
            select: { id: true, name: true },
          },
          _count: {
            select: { registrations: true },
          },
        },
      }),
      this.prisma.sportsEvent.count({ where }),
    ]);

    return { events, total, limit, offset };
  }

  async findSportsEventById(tenantId: string, id: string) {
    const event = await this.prisma.sportsEvent.findFirst({
      where: { id, tenantId },
      include: {
        team: true,
        homeTeam: true,
        awayTeam: true,
        registrations: {
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Sports event not found');
    }

    return event;
  }

  async updateSportsEvent(tenantId: string, id: string, dto: UpdateSportsEventDto) {
    await this.findSportsEventById(tenantId, id);

    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.prisma.sportsEvent.update({
      where: { id },
      data: updateData,
      include: {
        team: {
          select: { id: true, name: true, sport: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async deleteSportsEvent(tenantId: string, id: string) {
    await this.findSportsEventById(tenantId, id);

    return this.prisma.sportsEvent.delete({
      where: { id },
    });
  }

  // =============================================================================
  // CLUB EVENTS
  // =============================================================================

  async createClubEvent(tenantId: string, dto: CreateClubEventDto) {
    // Verify club exists
    await this.findClubById(tenantId, dto.clubId);

    return this.prisma.clubEvent.create({
      data: {
        tenantId,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        registrationDeadline: dto.registrationDeadline
          ? new Date(dto.registrationDeadline)
          : undefined,
      },
      include: {
        club: {
          select: { id: true, name: true, code: true, category: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async findAllClubEvents(tenantId: string, query: ClubEventQueryDto) {
    const { search, clubId, type, status, upcomingOnly, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (clubId) where.clubId = clubId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (upcomingOnly) {
      where.startDate = { gte: new Date() };
      where.status = { in: ['scheduled', 'ongoing'] };
    }

    const [events, total] = await Promise.all([
      this.prisma.clubEvent.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { startDate: upcomingOnly ? 'asc' : 'desc' },
        include: {
          club: {
            select: { id: true, name: true, code: true, category: true },
          },
          _count: {
            select: { registrations: true },
          },
        },
      }),
      this.prisma.clubEvent.count({ where }),
    ]);

    return { events, total, limit, offset };
  }

  async findClubEventById(tenantId: string, id: string) {
    const event = await this.prisma.clubEvent.findFirst({
      where: { id, tenantId },
      include: {
        club: true,
        registrations: {
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Club event not found');
    }

    return event;
  }

  async updateClubEvent(tenantId: string, id: string, dto: UpdateClubEventDto) {
    await this.findClubEventById(tenantId, id);

    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.prisma.clubEvent.update({
      where: { id },
      data: updateData,
      include: {
        club: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async deleteClubEvent(tenantId: string, id: string) {
    await this.findClubEventById(tenantId, id);

    return this.prisma.clubEvent.delete({
      where: { id },
    });
  }

  // =============================================================================
  // EVENT REGISTRATIONS
  // =============================================================================

  async registerForEvent(tenantId: string, dto: RegisterForEventDto) {
    const { studentId, sportsEventId, clubEventId } = dto;

    // Must have either sports event or club event
    if (!sportsEventId && !clubEventId) {
      throw new BadRequestException('Either sportsEventId or clubEventId is required');
    }

    if (sportsEventId && clubEventId) {
      throw new BadRequestException('Cannot register for both sports and club event at once');
    }

    // Check for existing registration
    const existing = await this.prisma.eventRegistration.findFirst({
      where: {
        tenantId,
        studentId,
        sportsEventId: sportsEventId || undefined,
        clubEventId: clubEventId || undefined,
      },
    });

    if (existing) {
      throw new ConflictException('Already registered for this event');
    }

    // Validate event exists and check capacity
    if (sportsEventId) {
      const event = await this.findSportsEventById(tenantId, sportsEventId);
      if (event.maxParticipants) {
        const registrationCount = await this.prisma.eventRegistration.count({
          where: { sportsEventId, status: { not: 'cancelled' } },
        });
        if (registrationCount >= event.maxParticipants) {
          throw new BadRequestException('Event has reached maximum participants');
        }
      }
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    if (clubEventId) {
      const event = await this.findClubEventById(tenantId, clubEventId);
      if (event.maxParticipants) {
        const registrationCount = await this.prisma.eventRegistration.count({
          where: { clubEventId, status: { not: 'cancelled' } },
        });
        if (registrationCount >= event.maxParticipants) {
          throw new BadRequestException('Event has reached maximum participants');
        }
      }
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    return this.prisma.eventRegistration.create({
      data: {
        tenantId,
        studentId,
        sportsEventId,
        clubEventId,
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        sportsEvent: {
          select: { id: true, name: true, startDate: true },
        },
        clubEvent: {
          select: { id: true, name: true, startDate: true },
        },
      },
    });
  }

  async updateRegistration(tenantId: string, id: string, dto: UpdateRegistrationDto) {
    const registration = await this.prisma.eventRegistration.findFirst({
      where: { id, tenantId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const updateData: any = { ...dto };
    if (dto.attended && !registration.attendedAt) {
      updateData.attendedAt = new Date();
    }

    return this.prisma.eventRegistration.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async cancelRegistration(tenantId: string, id: string) {
    const registration = await this.prisma.eventRegistration.findFirst({
      where: { id, tenantId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.eventRegistration.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async getStudentRegistrations(tenantId: string, studentId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { tenantId, studentId },
      include: {
        sportsEvent: {
          select: {
            id: true,
            name: true,
            type: true,
            sport: true,
            startDate: true,
            venue: true,
            status: true,
          },
        },
        clubEvent: {
          select: {
            id: true,
            name: true,
            type: true,
            startDate: true,
            venue: true,
            status: true,
            club: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  // =============================================================================
  // ACHIEVEMENTS
  // =============================================================================

  async createAchievement(tenantId: string, dto: CreateAchievementDto) {
    return this.prisma.achievement.create({
      data: {
        tenantId,
        ...dto,
        awardedDate: new Date(dto.awardedDate),
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        team: {
          select: { id: true, name: true, sport: true },
        },
        club: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async findAllAchievements(tenantId: string, query: AchievementQueryDto) {
    const { studentId, teamId, clubId, category, level, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (studentId) where.studentId = studentId;
    if (teamId) where.teamId = teamId;
    if (clubId) where.clubId = clubId;
    if (category) where.category = category;
    if (level) where.level = level;

    const [achievements, total] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { awardedDate: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: {
                select: { name: true, email: true },
              },
            },
          },
          team: {
            select: { id: true, name: true, sport: true },
          },
          club: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.prisma.achievement.count({ where }),
    ]);

    return { achievements, total, limit, offset };
  }

  async findAchievementById(tenantId: string, id: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        team: true,
        club: true,
      },
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    return achievement;
  }

  async updateAchievement(tenantId: string, id: string, dto: UpdateAchievementDto) {
    await this.findAchievementById(tenantId, id);

    const updateData: any = { ...dto };
    if (dto.verifiedBy && !updateData.verifiedAt) {
      updateData.verifiedAt = new Date();
    }

    return this.prisma.achievement.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async deleteAchievement(tenantId: string, id: string) {
    await this.findAchievementById(tenantId, id);

    return this.prisma.achievement.delete({
      where: { id },
    });
  }

  async verifyAchievement(tenantId: string, id: string, verifiedBy: string) {
    await this.findAchievementById(tenantId, id);

    return this.prisma.achievement.update({
      where: { id },
      data: {
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  // =============================================================================
  // ACTIVITY CREDITS
  // =============================================================================

  async createActivityCredit(tenantId: string, dto: CreateActivityCreditDto) {
    // Check if max credits exceeded for student in this category/year
    const existingCredits = await this.prisma.activityCredit.aggregate({
      where: {
        tenantId,
        studentId: dto.studentId,
        academicYear: dto.academicYear,
        category: dto.category,
      },
      _sum: { credits: true },
    });

    const currentCredits = existingCredits._sum.credits || 0;
    const maxCreditsPerCategory = 10; // This could be configurable

    if (currentCredits + dto.credits > maxCreditsPerCategory) {
      throw new BadRequestException(
        `Adding ${dto.credits} credits would exceed maximum of ${maxCreditsPerCategory} for ${dto.category} category in ${dto.academicYear}`
      );
    }

    return this.prisma.activityCredit.create({
      data: {
        tenantId,
        ...dto,
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async findAllActivityCredits(tenantId: string, query: ActivityCreditQueryDto) {
    const { studentId, academicYear, category, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYear = academicYear;
    if (category) where.category = category;

    const [credits, total] = await Promise.all([
      this.prisma.activityCredit.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ academicYear: 'desc' }, { awardedDate: 'desc' }],
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      }),
      this.prisma.activityCredit.count({ where }),
    ]);

    return { credits, total, limit, offset };
  }

  async getStudentCreditsSummary(tenantId: string, studentId: string, academicYear?: string) {
    const where: any = { tenantId, studentId };
    if (academicYear) where.academicYear = academicYear;

    const credits = await this.prisma.activityCredit.groupBy({
      by: ['category', 'academicYear'],
      where,
      _sum: { credits: true },
    });

    const totalCredits = credits.reduce((sum, c) => sum + (c._sum.credits || 0), 0);

    return {
      byCategory: credits,
      totalCredits,
      studentId,
      academicYear,
    };
  }

  async deleteActivityCredit(tenantId: string, id: string) {
    const credit = await this.prisma.activityCredit.findFirst({
      where: { id, tenantId },
    });

    if (!credit) {
      throw new NotFoundException('Activity credit not found');
    }

    return this.prisma.activityCredit.delete({
      where: { id },
    });
  }

  // =============================================================================
  // STATISTICS & DASHBOARD
  // =============================================================================

  async getStats(tenantId: string) {
    const [
      teamsCount,
      clubsCount,
      upcomingSportsEvents,
      upcomingClubEvents,
      recentAchievements,
      totalCreditsAwarded,
    ] = await Promise.all([
      this.prisma.sportsTeam.count({ where: { tenantId, status: 'active' } }),
      this.prisma.club.count({ where: { tenantId, status: 'active' } }),
      this.prisma.sportsEvent.count({
        where: { tenantId, status: 'scheduled', startDate: { gte: new Date() } },
      }),
      this.prisma.clubEvent.count({
        where: { tenantId, status: 'scheduled', startDate: { gte: new Date() } },
      }),
      this.prisma.achievement.count({
        where: {
          tenantId,
          awardedDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          },
        },
      }),
      this.prisma.activityCredit.aggregate({
        where: { tenantId },
        _sum: { credits: true },
      }),
    ]);

    return {
      teams: teamsCount,
      clubs: clubsCount,
      upcomingSportsEvents,
      upcomingClubEvents,
      recentAchievements,
      totalCreditsAwarded: totalCreditsAwarded._sum.credits || 0,
    };
  }

  async getStudentActivities(tenantId: string, studentId: string) {
    const [teams, clubs, registrations, achievements, credits] = await Promise.all([
      this.prisma.teamMember.findMany({
        where: { tenantId, studentId, status: 'active' },
        include: {
          team: {
            select: { id: true, name: true, sport: true, category: true },
          },
        },
      }),
      this.prisma.clubMember.findMany({
        where: { tenantId, studentId, status: 'active' },
        include: {
          club: {
            select: { id: true, name: true, code: true, category: true },
          },
        },
      }),
      this.prisma.eventRegistration.findMany({
        where: { tenantId, studentId },
        include: {
          sportsEvent: {
            select: { id: true, name: true, startDate: true, status: true },
          },
          clubEvent: {
            select: { id: true, name: true, startDate: true, status: true },
          },
        },
        orderBy: { registeredAt: 'desc' },
        take: 10,
      }),
      this.prisma.achievement.findMany({
        where: { tenantId, studentId },
        orderBy: { awardedDate: 'desc' },
        take: 10,
      }),
      this.getStudentCreditsSummary(tenantId, studentId),
    ]);

    return {
      teams,
      clubs,
      recentRegistrations: registrations,
      achievements,
      creditsSummary: credits,
    };
  }
}
