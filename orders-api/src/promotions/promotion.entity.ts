import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;
}
