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

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  lessonDate: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Group, (group) => group.lessons, { onDelete: 'CASCADE' })
  group: Group;

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments: Assignment[]; // Har bir dars bir nechta topshiriqqa ega bo'lishi mumkin
}
