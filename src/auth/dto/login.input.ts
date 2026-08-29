import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
