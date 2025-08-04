import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RemoveRefreshTokenCronjobs {
  private readonly logger = new Logger(RemoveRefreshTokenCronjobs.name)
  constructor(private readonly prismaService: PrismaService) {}

  @Cron('0 1 * * *') // Chạy lúc 1 giờ sáng mỗi ngày
  async handleCron() {
    this.logger.debug('Running RemoveRefreshTokenCronjobs at 1h every day')
    const refreshTokens = await this.prismaService.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    this.logger.debug(`Remove ${refreshTokens.count} expired refreshs tokens.`)
  }
}
