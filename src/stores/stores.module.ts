import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StoresService } from "./stores.service";
import { StoresResolver } from "./stores.resolver";
import { Store } from "./entities/store.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  providers: [StoresService, StoresResolver],
  exports: [StoresService],
})
export class StoresModule {}
