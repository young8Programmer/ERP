import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 15})
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ default: 'student' })
  role: string;

  @Column({ type: 'varchar', length: 50})
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ManyToMany(() => Group, (group) => group.students, { onDelete: "CASCADE"})
  groups: Group[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToOne(() => Profile, (profile) => profile.student, { onDelete: "CASCADE" })
  @JoinColumn()
  profile: Profile; // Added Profile relation
}
