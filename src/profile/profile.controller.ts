import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ProfilesService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesUserGuard } from 'src/auth/rolesUserGuard';
import { RolesStudentGuard } from 'src/auth/rolesStudentGuard';
import { RolesSuperAdminGuard } from 'src/auth/superAdmin.guard';
import { User } from 'src/auth/entities/user.entity';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  async createProfile(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.profilesService.createProfile(createProfileDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllProfiles(): Promise<Profile[]> {
    return this.profilesService.getAllProfiles();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyProfile(@Req() req: any): Promise<User> {
    const user = req.user; // Guard orqali request.user aniqlangan
    return user.profile
  }

  @UseGuards(AuthGuard)
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
