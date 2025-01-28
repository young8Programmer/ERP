import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard, Roles, RolesGuard } from 'src/auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  create(@Req() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    const studentId = req.user.id;
    return this.attendanceService.create(createAttendanceDto, studentId);
  }

  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Post('mark-teacher')
  markTeacherAttendance(@Req() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    const teacherId = req.user.id;
    return this.attendanceService.markTeacherAttendance(createAttendanceDto, teacherId);
  }

  
  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  
  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  
  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  
  @Roles("teacher")
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
