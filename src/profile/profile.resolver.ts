import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { UpdateProfileInput } from './dto/update-profile.input';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { name: 'profile' })
  getProfile() {
    return this.profileService.getPublicProfile();
  }

  @Mutation(() => Profile, { name: 'updateProfile' })
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.profileService.updateProfile(user.id, input);
  }
}
