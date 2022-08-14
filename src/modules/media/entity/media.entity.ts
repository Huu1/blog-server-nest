import { Article } from 'src/modules/Article/entity/article.entity';
import { Series } from 'src/modules/Series/entity/series.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';

export enum MediaType {
  image = 'image',
}

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: MediaType.image })
  type: string;

  @Column({ default: MediaType.image })
  url: string;

  @Column({ default: '' })
  thumbUrl: string;
}
