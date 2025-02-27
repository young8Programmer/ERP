import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  create(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.superAdminService.create(createSuperAdminDto);
  }

  @Get()
  findAll() {
    return this.superAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.superAdminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuperAdminDto: UpdateSuperAdminDto) {
    return this.superAdminService.update(+id, updateSuperAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.superAdminService.remove(+id);
  }
}
