import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Store } from "./entities/store.entity";
import { CreateStoreInput, UpdateStoreInput } from "./types/store.types";

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>
  ) {}

  async findAllActive(): Promise<Store[]> {
    return this.storesRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException("Store not found");
    }
    return store;
  }

  async create(
    createStoreInput: CreateStoreInput,
    userId: string
  ): Promise<Store> {
    const store = this.storesRepository.create({
      ...createStoreInput,
      userId,
    });
    return this.storesRepository.save(store);
  }

  async update(
    updateStoreInput: UpdateStoreInput,
    userId: string
  ): Promise<Store> {
    const { id, ...updateData } = updateStoreInput;

    const store = await this.findById(id);

    if (store.userId !== userId) {
      throw new ForbiddenException("You can only update stores you created");
    }

    await this.storesRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const store = await this.findById(id);

    if (store.userId !== userId) {
      throw new ForbiddenException("You can only delete stores you created");
    }

    await this.storesRepository.delete(id);
    return true;
  }

  async checkOwnership(storeId: string, userId: string): Promise<boolean> {
    const store = await this.findById(storeId);
    return store.userId === userId;
  }
}
