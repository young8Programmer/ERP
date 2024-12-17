// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('superAdmin')
  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.adminService.createAdmin(createAdminDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('superAdmin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: CreateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('superAdmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
