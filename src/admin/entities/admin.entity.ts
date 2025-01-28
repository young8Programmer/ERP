import { Profile } from 'src/profile/entities/profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: 'admin' })
  role: string;

  @OneToOne(() => Profile, (profile) => profile.admin, {onDelete: "CASCADE"})
  @JoinColumn()
  profile: Profile;
}
