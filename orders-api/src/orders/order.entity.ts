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
  @Index()
  customerId: number;

  @Column()
  promotionId: string;

  @Column()
  @Index()
  productId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
