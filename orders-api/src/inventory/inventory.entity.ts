import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'int' })
  quantity: number;
}
