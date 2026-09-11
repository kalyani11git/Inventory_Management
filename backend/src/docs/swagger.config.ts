import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const JWT_AUTH = 'JWT';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Inventory Manager API')
    .setDescription(
      [
        'REST API for the Inventory Management System.',
        '',
        '**How to try endpoints**',
        '1. Register or login under **auth**.',
        '2. Copy `accessToken` from the response.',
        '3. Click **Authorize**, paste the token, then Close.',
        '4. Protected routes send `Authorization: Bearer <token>`.',
        '',
        '**Roles**',
        '- `owner` — user management and owner dashboard (no product/category writes).',
        '- `user` — own products, categories, stock, and inventory dashboard.',
        '- The first registered account becomes `owner`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken from /auth/login or /auth/register',
      },
      JWT_AUTH,
    )
    .addTag('auth', 'Register, login, current session')
    .addTag('users', 'Owner-only account list and role changes')
    .addTag('categories', 'User-owned categories')
    .addTag('products', 'User-owned products, stock, and images')
    .addTag('dashboard', 'Role-specific overview stats')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Inventory Manager API',
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      displayRequestDuration: true,
    },
  });
}
