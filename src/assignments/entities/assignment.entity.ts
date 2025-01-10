import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
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

  @OneToOne(() => Submission, (submission) => submission.assignment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  submission: Submission; // Endi bitta topshiriq faqat bitta submission bilan bog'lanadi

  status: string;
}
