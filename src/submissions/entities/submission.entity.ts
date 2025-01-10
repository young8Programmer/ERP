import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from '../../students/entities/user.entity'; // To'g'ri entitetni import qilish

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  grade: number;

  @OneToOne(() => Assignment, (assignment) => assignment.submission)
  assignment: Assignment; // Endi bitta submission faqat bitta topshiriq bilan bog'lanadi

  @ManyToOne(() => Student, (student) => student.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
