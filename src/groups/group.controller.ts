import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  UnauthorizedException,
  ParseIntPipe, // NestJS'ning raqamga aylantirish uchun Pipe
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GroupsService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { RolesTeacherGuard } from 'src/auth/rolesTeacherGuard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // Faqat o'z guruhlarini ko'rish
  @UseGuards(AuthGuard, RolesTeacherGuard)
  @Roles('teacher')
  @Get('my-groups')
  async getMyGroups(@Request() req) {
    const teacherId = req.user.id;
    const groups = await this.groupsService.findByTeacherId(teacherId);
    return {
      message: 'Sizning guruhlaringiz',
      groups,
    };
  }

  // Guruh yaratish
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const teacherId = req.user.id;
    const group = await this.groupsService.create({
      ...createGroupDto,
      teacherId,
    });
    return {
      message: 'Guruh muvaffaqiyatli yaratildi',
      group,
    };
  }

  // Guruhni yangilash
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, // ID ni raqamga aylantirish
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req,
  ) {
    const teacherId = req.user.id;
    const group = await this.groupsService.findOne(id);

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    if (group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu guruhni boshqarish huquqiga ega emassiz',
      );
    }

    const updatedGroup = await this.groupsService.update(id, updateGroupDto);
    return {
      message: 'Guruh muvaffaqiyatli yangilandi',
      group: updatedGroup,
    };
  }

  // Guruhni o'chirish
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const teacherId = req.user.id;
    const group = await this.groupsService.findOne(id);

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    if (group.teacherId !== teacherId) {
      throw new UnauthorizedException(
        'Siz bu guruhni o‘chirish huquqiga ega emassiz',
      );
    }

    await this.groupsService.remove(id);
    return {
      message: 'Guruh muvaffaqiyatli o‘chirildi',
    };
  }
}
