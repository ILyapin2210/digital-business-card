import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SkillCategory } from '../entities/skill-category.enum';

@InputType()
export class UpdateSkillInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @Field(() => SkillCategory)
  @IsEnum(SkillCategory)
  category!: SkillCategory;
}
