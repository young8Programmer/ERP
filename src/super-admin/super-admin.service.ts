import { Injectable } from '@nestjs/common';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';

@Injectable()
export class SuperAdminService {
  create(createSuperAdminDto: CreateSuperAdminDto) {
    return 'This action adds a new superAdmin';
  }

  findAll() {
    return `This action returns all superAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} superAdmin`;
  }

  update(id: number, updateSuperAdminDto: UpdateSuperAdminDto) {
    return `This action updates a #${id} superAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} superAdmin`;
  }
}
