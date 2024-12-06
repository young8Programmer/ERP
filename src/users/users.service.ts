import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  // Barcha user-larni ko'rish
  findAll(): User[] {
    return this.users;
  }

  // Userni ID bo'yicha topish
  findOne(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  // User yaratish
  create(createUserDto: CreateUserDto): User {
    const newUser: User = { id: Date.now().toString(), ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  // Userni yangilash
  update(id: string, updateUserDto: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
    return this.users[userIndex];
  }

  // Userni o'chirish
  remove(id: string): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return undefined;

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return deletedUser;
  }
}
