import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.use("/api/v1/webhooks/stripe", (req, res, next) => {
      if (req.get("content-type") === "application/json") {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => {
          req.body = data;
          next();
        });
      } else {
        next();
      }
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
      exclude: ["/graphql"],
    });

    const port = configService.get<number>("PORT") || 3000;
    await app.listen(port);

    console.log(`🚀 Bookstore API is running!`);
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}

bootstrap();
