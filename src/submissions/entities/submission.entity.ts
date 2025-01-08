// submission.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from 'src/students/entities/user.entity';

// submission.entity.ts
@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  studentName: string;

  @Column({ nullable: true }) // Make content nullable
  content: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  assignment: Assignment;

  @Column()
  status: string;

  @Column()
  file: string;
}
