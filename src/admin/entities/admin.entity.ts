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

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 15})
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @OneToOne(() => Profile, (profile) => profile.admin, {onDelete: "CASCADE"})
  @JoinColumn()
  profile: Profile;
}
