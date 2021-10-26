import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  tagId: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'on' })
  status: string;

  @Column({ default: 'magenta' })
  color: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;
}
