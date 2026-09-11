import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthUser } from '../common/roles';
import { JWT_AUTH } from '../docs/swagger.config';
import {
  AuthResponseDto,
  ErrorResponseDto,
  MeResponseDto,
  MessageResponseDto,
} from '../docs/swagger-models';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register',
    description:
      'Creates an account. The first user is promoted to owner; later users get the user role.',
  })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Email already exists',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid email or password',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth(JWT_AUTH)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Current user' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @ApiBearerAuth(JWT_AUTH)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Client should still delete the stored JWT.',
  })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  logout() {
    return { message: 'Logged out' };
  }
}
