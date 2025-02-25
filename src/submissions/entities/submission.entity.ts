import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from '../../students/entities/student.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  UNSUBMITTED = 'unsubmitted',
}

@Entity()
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

  @Column({ type: 'text', nullable: true }) // 🔹 Izoh (comment)
  comment: string;

  @Column({ type: 'bytea', nullable: false })
  fileData: Buffer;

  @Column({ type: 'text', nullable: false })
  fileName: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, { nullable: false })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.submissions, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
