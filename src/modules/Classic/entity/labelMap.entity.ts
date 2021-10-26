import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class LabelMap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  articleId: string;

  @Column({ default: '' })
  labelId: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;
}
