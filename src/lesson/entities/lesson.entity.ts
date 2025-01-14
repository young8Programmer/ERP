import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  lessonNumber: string;

  @CreateDateColumn({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Group, (group) => group.lessons, { onDelete: 'CASCADE' })
  group: Group;

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments: Assignment[];

  @OneToMany(() => Attendance, (attendance) => attendance.lesson)
  attendances: Attendance[];
}
