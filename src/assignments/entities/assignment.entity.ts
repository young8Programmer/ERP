import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Submission } from 'src/submissions/entities/submission.entity'; // Submission entitetini import qilish

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assignment: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @OneToMany(() => Submission, (submission) => submission.assignment)
  submissions: Submission[];

  status: string
}
