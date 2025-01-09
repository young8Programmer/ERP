import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  private groups = []; // Guruhlarni saqlash uchun vaqtinchalik massiv

  // Faqat o'qituvchining guruhlarini olish
  async findByTeacherId(teacherId: number) {
    const teacherGroups = this.groups.filter(
      (group) => group.teacherId === teacherId,
    );
    return teacherGroups;
  }

  // Bitta guruhni ID bo'yicha topish
  async findOne(groupId: number) {
    const group = this.groups.find((group) => group.id === groupId);
    if (!group) {
      throw new NotFoundException(`Guruh topilmadi (ID: ${groupId})`);
    }
    return group;
  }

  // Yangi guruh yaratish
  async create(createGroupDto: CreateGroupDto) {
    const newGroup = {
      id: this.groups.length + 1, // ID avtomatik oshiriladi
      ...createGroupDto,
    };
    this.groups.push(newGroup);
    return newGroup;
  }

  // Guruhni yangilash
  async update(groupId: number, updateGroupDto: UpdateGroupDto) {
    const groupIndex = this.groups.findIndex((group) => group.id === groupId);
    if (groupIndex === -1) {
      throw new NotFoundException(`Guruh topilmadi (ID: ${groupId})`);
    }

    const updatedGroup = {
      ...this.groups[groupIndex],
      ...updateGroupDto,
    };
    this.groups[groupIndex] = updatedGroup;

    return updatedGroup;
  }

  // Guruhni o'chirish
  async remove(groupId: number) {
    const groupIndex = this.groups.findIndex((group) => group.id === groupId);
    if (groupIndex === -1) {
      throw new NotFoundException(`Guruh topilmadi (ID: ${groupId})`);
    }

    const removedGroup = this.groups.splice(groupIndex, 1);
    return removedGroup;
  }
}
