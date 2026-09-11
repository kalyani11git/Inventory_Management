import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../common/roles';
import { JWT_AUTH } from '../docs/swagger.config';
import { DashboardStatsDto, ErrorResponseDto } from '../docs/swagger-models';

@ApiTags('dashboard')
@ApiBearerAuth(JWT_AUTH)
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Dashboard stats',
    description:
      'Users get inventory counts. Owners get user analytics (`userAnalytics`).',
  })
  @ApiOkResponse({ type: DashboardStatsDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getStats(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getStats(user);
  }
}
