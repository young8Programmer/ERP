import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Submission } from 'src/submissions/entities/submission.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true }) 
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  dueDate: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @OneToMany(() => Submission, (submission) => submission.assignment)
  submissions: Submission[];

  @Column({ default: 'pending' })
  status: string;
}
