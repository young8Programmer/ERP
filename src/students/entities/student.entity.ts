import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { User } from 'src/auth/entities/user.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ default: 'student' })
  role: string;

  @ManyToMany(() => Group, (group) => group.students, { cascade: true })
  groups: Group[];

  @OneToMany(() => User, (user) => user.student)
  users: User[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];
}
