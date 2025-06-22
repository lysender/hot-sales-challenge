import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity()
@Index(['customerId', 'promotionId', 'productId'], { unique: true })
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  customerId: number;

  @Column()
  promotionId: string;

  @Column()
  productId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
