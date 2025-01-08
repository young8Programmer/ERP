import { Profile } from 'src/profile/entities/profile.entity';
import { Student } from 'src/students/entities/user.entity';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToMany } from 'typeorm';

enum Role {
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 2500 })
  password: string;

  @Column({ type: 'varchar', length: 2500 })
  email: string;

  @Column()
  role: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn() // Bog‘lanishni amalga oshiramiz
  profile: Profile;
  
  @Column({ nullable: true }) // Teacher bo'lmasa null bo'ladi
  teacherId: number;

  @Column({ nullable: true }) // Student bo'lmasa null bo'ladi
  studentId: number;

  @ManyToMany(() => Teacher, (teacher) => teacher.users)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.users)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}


