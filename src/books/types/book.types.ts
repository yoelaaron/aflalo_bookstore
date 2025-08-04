import { ObjectType, Field, InputType, ID, Float, Int } from "@nestjs/graphql";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";

@ObjectType()
export class BookType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isActive: boolean;

  @Field()
  userId: string;

  @Field()
  storeId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  @MaxLength(200)
  title: string;

  @Field()
  @IsString()
  @MaxLength(100)
  author: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stock: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => ID)
  @IsString()
  storeId: string;
}

@InputType()
export class UpdateBookInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
