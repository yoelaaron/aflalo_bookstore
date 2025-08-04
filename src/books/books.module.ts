import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksService } from "./books.service";
import { BooksResolver } from "./books.resolver";
import { Book } from "./entities/book.entity";
import { StoresModule } from "../stores/stores.module";

@Module({
  imports: [TypeOrmModule.forFeature([Book]), StoresModule],
  providers: [BooksService, BooksResolver],
  exports: [BooksService],
})
export class BooksModule {}
