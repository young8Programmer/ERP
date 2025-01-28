import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfilesService } from './profile.service';
import { CreateProfileDto } from './dto/create.profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { AuthGuard, Roles } from 'src/auth/auth.guard';

@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Roles('admin', 'student')
  @UseGuards(AuthGuard)
  @Post()
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.createProfile(createProfileDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllProfiles(): Promise<Profile[]> {
    return this.profilesService.getAllProfiles();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyProfile(@Req() req: any): Promise<Profile> {
    const userId = req.user.id;
    return this.profilesService.getMyProfile(userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getProfileById(@Param('id') id: number): Promise<Profile> {
    return this.profilesService.getProfileById(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateProfile(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.updateProfile(id, updateProfileDto);
  }

  
  @Roles('admin')
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProfile(@Param('id') id: number): Promise<void> {
    await this.profilesService.deleteProfile(id);
  }
}
