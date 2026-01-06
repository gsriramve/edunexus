import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsOptional()
  hodId?: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  hodId?: string;
}
