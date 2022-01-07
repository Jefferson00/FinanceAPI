import { Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  // eslint-disable-next-line prettier/prettier
  constructor(private userService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.users();
  }
}