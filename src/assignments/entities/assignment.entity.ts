import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assignment: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date; // dueDate qo‘shildi

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  submissions: any;
  status: string;
}
