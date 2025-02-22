import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from '../../students/entities/student.entity';

export enum SubmissionStatus {
  PENDING = 'pending', // Kutayotgan
  REJECTED = 'rejected', // Qaytarilgan
  ACCEPTED = 'accepted', // Qabul qilingan
}

@Entity()
@Unique(['assignment', 'student'])
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({ type: 'int', default: 0 })
  grade: number;

  @Column({ type: 'text', nullable: true }) // Izoh uchun maydon
  comment: string;

  @Column({ type: 'text', nullable: true }) // Fayl uchun URL
  fileUrl: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.submissions)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
