import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesUserGuard } from 'src/auth/rolesUserGuard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  async createProfile(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.profilesService.createProfile(createProfileDto);
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Get()
  async getAllProfiles(): Promise<Profile[]> {
    return this.profilesService.getAllProfiles();
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Get(':id')
  async getProfileById(@Param('id') id: number): Promise<Profile> {
    return this.profilesService.getProfileById(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateProfile(@Param('id') id: number, @Body() updateProfileDto: UpdateProfileDto): Promise<Profile> {
    return this.profilesService.updateProfile(id, updateProfileDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(':id')
  async deleteProfile(@Param('id') id: number): Promise<void> {
    await this.profilesService.deleteProfile(id);
  }
}
