import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class UpdateSettingsBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingDto)
  settings: UpdateSettingDto[];
}
