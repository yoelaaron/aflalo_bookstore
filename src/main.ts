import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
    });

    const configService = app.get(ConfigService);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    app.useGlobalInterceptors(new TransformInterceptor());

    app.setGlobalPrefix("api/v1", {
      exclude: ["/graphql"], // Exclude GraphQL from prefix
    });

    const port = configService.get<number>("PORT") || 3000;
    await app.listen(port);

    console.log(`Bookstore API is running!`);
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

bootstrap();
