import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger/dist/decorators';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { NAME_TAG_TYPE, WATCH_LIST } from '../../../shared';
import { IsValidBench32Address } from '../validators/validate-address';
import { User } from '../../../shared/entities/user.entity';
import { MatchKeys } from '../validators/match-keys';
import { MatchType } from '../validators/match-type';
export class CreateWatchListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsValidBench32Address('address')
  address: string;

  @ApiProperty({ default: NAME_TAG_TYPE.ACCOUNT })
  @IsIn([NAME_TAG_TYPE.ACCOUNT, NAME_TAG_TYPE.CONTRACT])
  @MatchType('address')
  type: NAME_TAG_TYPE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  favorite: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tracking: boolean;

  @ApiPropertyOptional({ maxLength: WATCH_LIST.NOTE_MAX_LENGTH })
  @IsOptional()
  note: string;

  @ApiProperty({ default: WATCH_LIST.SETTINGS_EXAMPLE })
  @IsNotEmpty()
  @MatchKeys(WATCH_LIST.SETTINGS_EXAMPLE)
  settings: JSON;

  user: User;
}
