import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import {GroupUpdateDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['courses', 'students', 'teachers'] });
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id }, relations: ['courses', 'students', 'teachers'] });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async updateGroup(id: number, updateGroupDto: GroupUpdateDto): Promise<Group> {
    const group = await this.getGroupById(id);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.getGroupById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    await this.groupRepository.remove(group);
  }
}
