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
} from '@nestjs/common';
import { LibraryService } from './library.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBookDto,
  UpdateBookDto,
  BookQueryDto,
  CreateCardDto,
  UpdateCardDto,
  CardQueryDto,
  IssueBookDto,
  ReturnBookDto,
  RenewBookDto,
  IssueQueryDto,
  CreateReservationDto,
  ReservationQueryDto,
  CreateEResourceDto,
  UpdateEResourceDto,
  EResourceQueryDto,
  UpdateSettingsDto,
} from './dto/library.dto';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // =============================================================================
  // CATEGORIES
  // =============================================================================

  @Post('categories')
  createCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.libraryService.createCategory(tenantId, dto);
  }

  @Get('categories')
  findAllCategories(@Headers('x-tenant-id') tenantId: string) {
    return this.libraryService.findAllCategories(tenantId);
  }

  @Get('categories/:id')
  findCategoryById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findCategoryById(tenantId, id);
  }

  @Patch('categories/:id')
  updateCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.libraryService.updateCategory(tenantId, id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.deleteCategory(tenantId, id);
  }

  // =============================================================================
  // BOOKS
  // =============================================================================

  @Post('books')
  createBook(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBookDto,
  ) {
    return this.libraryService.createBook(tenantId, dto);
  }

  @Get('books')
  findAllBooks(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: BookQueryDto,
  ) {
    return this.libraryService.findAllBooks(tenantId, query);
  }

  @Get('books/:id')
  findBookById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findBookById(tenantId, id);
  }

  @Patch('books/:id')
  updateBook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.libraryService.updateBook(tenantId, id, dto);
  }

  @Delete('books/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.deleteBook(tenantId, id);
  }

  // =============================================================================
  // LIBRARY CARDS
  // =============================================================================

  @Post('cards')
  createCard(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.libraryService.createCard(tenantId, dto);
  }

  @Get('cards')
  findAllCards(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: CardQueryDto,
  ) {
    return this.libraryService.findAllCards(tenantId, query);
  }

  @Get('cards/:id')
  findCardById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findCardById(tenantId, id);
  }

  @Get('cards/student/:studentId')
  findCardByStudent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.libraryService.findCardByStudent(tenantId, studentId);
  }

  @Patch('cards/:id')
  updateCard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.libraryService.updateCard(tenantId, id, dto);
  }

  // =============================================================================
  // BOOK ISSUES
  // =============================================================================

  @Post('issues')
  issueBook(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: IssueBookDto,
  ) {
    return this.libraryService.issueBook(tenantId, dto);
  }

  @Get('issues')
  findAllIssues(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: IssueQueryDto,
  ) {
    return this.libraryService.findAllIssues(tenantId, query);
  }

  @Get('issues/:id')
  findIssueById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findIssueById(tenantId, id);
  }

  @Get('issues/card/:cardId')
  findIssuesByCard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.libraryService.findIssuesByCard(tenantId, cardId);
  }

  @Post('issues/:id/return')
  returnBook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReturnBookDto,
  ) {
    return this.libraryService.returnBook(tenantId, id, dto);
  }

  @Post('issues/:id/renew')
  renewBook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: RenewBookDto,
  ) {
    return this.libraryService.renewBook(tenantId, id, dto);
  }

  // =============================================================================
  // RESERVATIONS
  // =============================================================================

  @Post('reservations')
  createReservation(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.libraryService.createReservation(tenantId, dto);
  }

  @Get('reservations')
  findAllReservations(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ReservationQueryDto,
  ) {
    return this.libraryService.findAllReservations(tenantId, query);
  }

  @Get('reservations/:id')
  findReservationById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findReservationById(tenantId, id);
  }

  @Post('reservations/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelReservation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.cancelReservation(tenantId, id);
  }

  @Post('reservations/:id/collect')
  @HttpCode(HttpStatus.OK)
  collectReservation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.collectReservation(tenantId, id);
  }

  // =============================================================================
  // E-RESOURCES
  // =============================================================================

  @Post('e-resources')
  createEResource(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateEResourceDto,
  ) {
    return this.libraryService.createEResource(tenantId, dto);
  }

  @Get('e-resources')
  findAllEResources(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: EResourceQueryDto,
  ) {
    return this.libraryService.findAllEResources(tenantId, query);
  }

  @Get('e-resources/:id')
  findEResourceById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.findEResourceById(tenantId, id);
  }

  @Patch('e-resources/:id')
  updateEResource(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEResourceDto,
  ) {
    return this.libraryService.updateEResource(tenantId, id, dto);
  }

  @Delete('e-resources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEResource(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.deleteEResource(tenantId, id);
  }

  @Post('e-resources/:id/view')
  @HttpCode(HttpStatus.OK)
  recordView(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.recordView(tenantId, id);
  }

  @Post('e-resources/:id/download')
  @HttpCode(HttpStatus.OK)
  recordDownload(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.libraryService.recordDownload(tenantId, id);
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  @Get('settings')
  getSettings(@Headers('x-tenant-id') tenantId: string) {
    return this.libraryService.getSettings(tenantId);
  }

  @Patch('settings')
  updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.libraryService.updateSettings(tenantId, dto);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.libraryService.getStats(tenantId);
  }
}
