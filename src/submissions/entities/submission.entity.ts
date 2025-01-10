import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from '../../students/entities/user.entity'; // To'g'ri entitetni import qilish

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  grade: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.submissions) // To'g'ri bog'liqlikni o'rnatish
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
