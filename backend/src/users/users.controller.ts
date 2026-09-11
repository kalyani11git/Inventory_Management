import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, AuthUser } from '../common/roles';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JWT_AUTH } from '../docs/swagger.config';
import { ErrorResponseDto, UserPublicDto } from '../docs/swagger-models';

@ApiTags('users')
@ApiBearerAuth(JWT_AUTH)
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: 'Owner role required',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users', description: 'Owner only.' })
  @ApiOkResponse({ type: [UserPublicDto] })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Change user role',
    description: 'Cannot demote the last owner or remove your own owner role.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserPublicDto })
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role, user.id);
  }
}
