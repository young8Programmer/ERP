import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './group.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    try {
      const groups = await this.groupsService.findAll();
      return { message: 'Barcha guruhlar muvaffaqiyatli olingan.', groups };
    } catch (error) {
      throw new Error('Barcha guruhlarni olishda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() groupData: { name: string }) {
    try {
      const createdGroup = await this.groupsService.create(groupData);
      return {
        message: 'Guruh muvaffaqiyatli yaratildi.',
        group: createdGroup,
      };
    } catch (error) {
      throw new Error('Guruhni yaratishda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    try {
      const updatedGroup = await this.groupsService.update(id, updateGroupDto);
      if (!updatedGroup) {
        throw new NotFoundException(`Guruh topilmadi (ID: ${id})`);
      }
      return {
        message: 'Guruh muvaffaqiyatli yangilandi.',
        group: updatedGroup,
      };
    } catch (error) {
      throw new Error('Guruhni yangilashda xatolik yuz berdi');
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.groupsService.remove(id);
      return { message: `Guruh muvaffaqiyatli o'chirildi (ID: ${id})` };
    } catch (error) {
      throw new Error("Guruhni o'chirishda xatolik yuz berdi");
    }
  }
}
