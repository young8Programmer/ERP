import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({ type: "decimal", nullable: true })
  lessonDate: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Group, (group) => group.lessons, { onDelete: 'CASCADE' })
  group: Group;

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments: Assignment[];

  @ManyToOne(() => Assignment, (assignment) => assignment.lesson)
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;
}
