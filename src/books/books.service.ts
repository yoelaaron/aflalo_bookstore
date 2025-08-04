import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "./entities/book.entity";
import { CreateBookInput, UpdateBookInput } from "./types/book.types";
import { StoresService } from "../stores/stores.service";

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    private storesService: StoresService
  ) {}

  async findAllActive(): Promise<Book[]> {
    return this.booksRepository.find({
      where: { isActive: true },
      relations: ["store"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<Book[]> {
    return this.booksRepository.find({
      where: { userId },
      relations: ["store"],
      order: { createdAt: "DESC" },
    });
  }

  async findByStore(storeId: string): Promise<Book[]> {
    return this.booksRepository.find({
      where: { storeId, isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ["store"],
    });
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    return book;
  }

  async create(
    createBookInput: CreateBookInput,
    userId: string
  ): Promise<Book> {
    const { storeId, ...bookData } = createBookInput;

    const isOwner = await this.storesService.checkOwnership(storeId, userId);
    if (!isOwner) {
      throw new ForbiddenException("You can only add books to stores you own");
    }

    const book = this.booksRepository.create({
      ...bookData,
      storeId,
      userId,
    });

    return this.booksRepository.save(book);
  }

  async update(
    updateBookInput: UpdateBookInput,
    userId: string
  ): Promise<Book> {
    const { id, ...updateData } = updateBookInput;

    const book = await this.findById(id);

    if (book.userId !== userId) {
      throw new ForbiddenException("You can only update books you created");
    }

    await this.booksRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const book = await this.findById(id);

    if (book.userId !== userId) {
      throw new ForbiddenException("You can only delete books you created");
    }

    await this.booksRepository.delete(id);
    return true;
  }

  async search(query: string): Promise<Book[]> {
    return this.booksRepository
      .createQueryBuilder("book")
      .where("book.isActive = :isActive", { isActive: true })
      .andWhere(
        "(book.title ILIKE :query OR book.author ILIKE :query OR book.isbn ILIKE :query)",
        { query: `%${query}%` }
      )
      .orderBy("book.createdAt", "DESC")
      .getMany();
  }

  async updateStock(bookId: string, quantity: number): Promise<Book> {
    const book = await this.findById(bookId);

    if (book.stock < quantity) {
      throw new ForbiddenException("Insufficient stock");
    }

    await this.booksRepository.update(bookId, {
      stock: book.stock - quantity,
    });

    return this.findById(bookId);
  }
}
