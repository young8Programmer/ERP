import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Student } from 'src/students/entities/student.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  UNSUBMITTED = 'unsubmitted',
}

@Entity('submissions')
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

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true })
  fileUrl: string; // Backblaze B2’dan kelgan fayl URL’i

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.submissions, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}