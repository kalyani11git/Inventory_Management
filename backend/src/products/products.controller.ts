import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser, UserRole } from '../common/roles';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JWT_AUTH } from '../docs/swagger.config';
import {
  ErrorResponseDto,
  MessageResponseDto,
  ProductListResponseDto,
  ProductResponseDto,
} from '../docs/swagger-models';

@ApiTags('products')
@ApiBearerAuth(JWT_AUTH)
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Create product',
    description: 'Status is set from quantity. SKU must be unique.',
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List products',
    description: 'Search, filter, sort and paginate. Users see only their own.',
  })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryProductsDto) {
    return this.productsService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ProductResponseDto })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.findOne(user, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.remove(user, id);
  }

  @Patch(':id/stock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Increase or decrease stock',
    description: 'Quantity cannot go below 0. Status updates automatically.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  adjustStock(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(user, id, dto);
  }

  @Post(':id/image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Upload product image',
    description: 'JPG, PNG or WEBP. Max 2MB. Field name: `file`.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname).toLowerCase());
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /\/(jpg|jpeg|png|webp)$/i.test(file.mimetype);
        if (!ok) {
          cb(new BadRequestException('Only JPG, PNG or WEBP images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please choose an image file');
    }
    return this.productsService.saveImage(user, id, file.filename);
  }
}
