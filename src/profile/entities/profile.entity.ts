import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Teacher } from 'src/teacher/entities/teacher.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Student } from 'src/students/entities/student.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 , nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 50 , nullable: true })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;
  
  @Column({ type: 'varchar', length: 255 , nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @OneToOne(() => Teacher, (teacher) => teacher.profile)
  teacher: Teacher; 
  
  @OneToOne(() => Admin, (admin) => admin.profile)
  admin: Admin; 
  
  @OneToOne(() => Student, (student) => student.profile)
  student: Student; 
}
