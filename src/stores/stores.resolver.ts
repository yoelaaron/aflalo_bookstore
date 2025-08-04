import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { StoresService } from "./stores.service";
import {
  StoreType,
  CreateStoreInput,
  UpdateStoreInput,
} from "./types/store.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { User } from "../users/entities/user.entity";

@Resolver(() => StoreType)
export class StoresResolver {
  constructor(private readonly storesService: StoresService) {}

  @Public()
  @Query(() => [StoreType], { description: "Get all active stores (public)" })
  async stores(): Promise<StoreType[]> {
    return this.storesService.findAllActive();
  }

  @Query(() => [StoreType], {
    description: "Get stores created by current user",
  })
  async myStores(@CurrentUser() user: User): Promise<StoreType[]> {
    return this.storesService.findByUser(user.id);
  }

  @Public()
  @Query(() => StoreType, { description: "Get store by ID" })
  async store(@Args("id") id: string): Promise<StoreType> {
    return this.storesService.findById(id);
  }

  @Mutation(() => StoreType, { description: "Create a new store" })
  async createStore(
    @Args("input") createStoreInput: CreateStoreInput,
    @CurrentUser() user: User
  ): Promise<StoreType> {
    return this.storesService.create(createStoreInput, user.id);
  }

  @Mutation(() => StoreType, { description: "Update store (owner only)" })
  async updateStore(
    @Args("input") updateStoreInput: UpdateStoreInput,
    @CurrentUser() user: User
  ): Promise<StoreType> {
    return this.storesService.update(updateStoreInput, user.id);
  }

  @Mutation(() => Boolean, { description: "Delete store (owner only)" })
  async deleteStore(
    @Args("id") id: string,
    @CurrentUser() user: User
  ): Promise<boolean> {
    return this.storesService.delete(id, user.id);
  }
}
