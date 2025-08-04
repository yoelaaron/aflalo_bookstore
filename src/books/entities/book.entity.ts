import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Store } from "../../stores/entities/store.entity";
import { CartItem } from "src/carts/entities/cart-item.entity";

@Entity("books")
export class Book {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  isbn: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("uuid")
  userId: string;

  @ManyToOne(() => User, (user) => user.books, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column("uuid")
  storeId: string;

  @ManyToOne(() => Store, (store) => store.books, { onDelete: "CASCADE" })
  @JoinColumn({ name: "storeId" })
  store: Store;

  @OneToMany(() => CartItem, (cartItem) => cartItem.book)
  cartItems: CartItem[];
}
