import { InputType, Field } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsUrl,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSkillInput } from './update-skill.input';

@InputType()
export class UpdateProfileInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Field()
  @IsString()
  @MaxLength(120)
  headline!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @Field()
  @IsString()
  @MaxLength(120)
  location!: string;

  @Field()
  @IsString()
  @MaxLength(120)
  availability!: string;

  @Field()
  @IsString()
  @ValidateIf((profile: UpdateProfileInput) => profile.githubUrl.length > 0)
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  githubUrl!: string;

  @Field()
  @IsString()
  @ValidateIf((profile: UpdateProfileInput) => profile.telegramUrl.length > 0)
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  telegramUrl!: string;

  @Field()
  @IsString()
  @ValidateIf((profile: UpdateProfileInput) => profile.contactEmail.length > 0)
  @IsEmail()
  @MaxLength(254)
  contactEmail!: string;

  @Field()
  @IsString()
  @ValidateIf((profile: UpdateProfileInput) => profile.resumeUrl.length > 0)
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  resumeUrl!: string;

  @Field()
  @IsString()
  @MaxLength(1000)
  experience!: string;

  @Field()
  @IsString()
  @MaxLength(1000)
  highlights!: string;

  @Field(() => [UpdateSkillInput])
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpdateSkillInput)
  skills!: UpdateSkillInput[];
}
