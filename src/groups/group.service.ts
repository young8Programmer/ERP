import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  findAll() {
    return this.groupRepository.find({ relations: ['lessons'] });
  }

  create(groupData: Partial<Group>) {
    const group = this.groupRepository.create(groupData);
    return this.groupRepository.save(group);
  }

  // Update Group by ID (converting id to number)
  async update(id: string, updateGroupDto: UpdateGroupDto) {
    const groupId = Number(id); // Convert string id to number
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Guruhni yangilash
    const updatedGroup = await this.groupRepository.save({
      ...group,
      ...updateGroupDto,
    });
    return updatedGroup;
  }

  // Delete Group by ID (converting id to number)
  async remove(id: string) {
    const groupId = Number(id); // Convert string id to number
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Guruhni o'chirish
    await this.groupRepository.delete(groupId);
    return { message: `Group with ID ${id} successfully deleted` };
  }
}
