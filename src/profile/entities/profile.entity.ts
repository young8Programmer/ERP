import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string; // Profil rasmi

  @Column({ type: 'text', nullable: true })
  bio: string; // Qisqacha ma'lumot

  @Column({ type: 'int', nullable: true })
  age: number; // Yoshi

  @Column({ type: 'varchar', length: 15, nullable: true })
  contactNumber: string; // Telefon raqami
}
