import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    const users = this.usersService.findAll();
    return {
      message: 'All users retrieved successfully!',
      data: users,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id);
    if (!user) {
      return { message: `User with ID ${id} not found!` };
    }
    return {
      message: `User with ID ${id} retrieved successfully!`,
      data: user,
    };
  }

  @Post()
  create(@Body() createUserDto: any) {
    const newUser = this.usersService.create(createUserDto);
    return {
      message: 'User created successfully!',
      data: newUser,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    const updatedUser = this.usersService.update(id, updateUserDto);
    if (!updatedUser) {
      return { message: `User with ID ${id} not found!` };
    }
    return {
      message: `User with ID ${id} updated successfully!`,
      data: updatedUser,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const deletedUser = this.usersService.remove(id);
    if (!deletedUser) {
      return { message: `User with ID ${id} not found!` };
    }
    return {
      message: `User with ID ${id} deleted successfully!`,
      data: deletedUser,
    };
  }
}
