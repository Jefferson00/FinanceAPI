/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar: string | null;

  @Field({ nullable: true })
  phone: string | null;
}