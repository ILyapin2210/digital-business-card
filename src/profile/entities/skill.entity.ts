import { ObjectType, Field } from '@nestjs/graphql';
import { SkillCategory } from './skill-category.enum';

@ObjectType()
export class Skill {
  @Field()
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;
}
