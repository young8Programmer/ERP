import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Entity('teachers')
export class Teacher {
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

  @Column({ type: 'varchar', length: 100 })
  specialty: string;

  @Column({ default: 'teacher' })
  role: string;

  @Column({ type: 'varchar', length: 100})
  username: string; // Added username field

  @Column({ type: 'varchar', length: 255 })
  password: string; // Added password field

  @OneToMany(() => Group, (group) => group.teacher, { onDelete: "CASCADE" })
  groups: Group[];

  @OneToOne(() => Profile, (profile) => profile.teacher, { onDelete: "CASCADE"})
  @JoinColumn()
  profile: Profile; // Added Profile relation
}
