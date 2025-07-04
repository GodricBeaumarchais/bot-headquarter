import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active CORS pour autoriser le frontend
  app.enableCors({
    origin: true, // autorise toutes les origines en développement
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  await app.listen(process.env.PORT ?? 3001); // Mets bien 3001 si c'est le port attendu
}
bootstrap();