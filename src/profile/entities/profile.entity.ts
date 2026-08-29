import { Field, ObjectType } from '@nestjs/graphql';
import { Skill } from './skill.entity';

@ObjectType()
export class Profile {
  @Field()
  name!: string;

  @Field()
  headline!: string;

  @Field()
  description!: string;

  @Field()
  location!: string;

  @Field()
  availability!: string;

  @Field()
  githubUrl!: string;

  @Field()
  telegramUrl!: string;

  @Field()
  contactEmail!: string;

  @Field()
  resumeUrl!: string;

  @Field()
  experience!: string;

  @Field()
  highlights!: string;

  @Field(() => [Skill])
  skills!: Skill[];
}
