import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';

@Entity('teachers')
export class Teacher {   
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

  @Column({ type: 'varchar', length: 100 })
  specialty: string;

  @Column({default: "teacher"})
  role: string;

  @ManyToMany(() => Group, (group) => group.teachers)
  groups: Group[];
}
