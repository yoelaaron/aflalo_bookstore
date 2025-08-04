import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BookType, CreateBookInput, UpdateBookInput } from "./types/book.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { User } from "../users/entities/user.entity";

@Resolver(() => BookType)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Query(() => [BookType], { description: "Get all active books (public)" })
  async books(): Promise<BookType[]> {
    return this.booksService.findAllActive();
  }

  @Query(() => [BookType], { description: "Get books created by current user" })
  async myBooks(@CurrentUser() user: User): Promise<BookType[]> {
    return this.booksService.findByUser(user.id);
  }

  @Public()
  @Query(() => [BookType], { description: "Get books by store ID" })
  async booksByStore(@Args("storeId") storeId: string): Promise<BookType[]> {
    return this.booksService.findByStore(storeId);
  }

  @Public()
  @Query(() => BookType, { description: "Get book by ID" })
  async book(@Args("id") id: string): Promise<BookType> {
    return this.booksService.findById(id);
  }

  @Public()
  @Query(() => [BookType], {
    description: "Search books by title, author, or ISBN",
  })
  async searchBooks(@Args("query") query: string): Promise<BookType[]> {
    return this.booksService.search(query);
  }

  @Mutation(() => BookType, { description: "Create a new book" })
  async createBook(
    @Args("input") createBookInput: CreateBookInput,
    @CurrentUser() user: User
  ): Promise<BookType> {
    return this.booksService.create(createBookInput, user.id);
  }

  @Mutation(() => BookType, { description: "Update book (owner only)" })
  async updateBook(
    @Args("input") updateBookInput: UpdateBookInput,
    @CurrentUser() user: User
  ): Promise<BookType> {
    return this.booksService.update(updateBookInput, user.id);
  }

  @Mutation(() => Boolean, { description: "Delete book (owner only)" })
  async deleteBook(
    @Args("id") id: string,
    @CurrentUser() user: User
  ): Promise<boolean> {
    return this.booksService.delete(id, user.id);
  }
}
