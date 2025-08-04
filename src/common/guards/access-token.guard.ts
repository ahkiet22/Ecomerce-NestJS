import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from '../constants/auth.constant'
import { TokenService } from 'src/modules/token/token.service'
import { AccessTokenPayload } from 'src/types/jwt'
import { HTTPMethod } from '../constants/role.constant'
import { PrismaService } from 'src/prisma/prisma.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RolePermissionsType } from '../models/role.model'
import { Cache } from 'cache-manager'
import { keyBy } from 'lodash'

type Permission = RolePermissionsType['permissions'][number]
type CachedRole = RolePermissionsType & {
  permissions: {
    [key: string]: Permission
  }
}
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Check user permission
    await this.validateUserPermission(decodedAccessToken, request)

    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)

      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId: number = decodedAccessToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const cacheKey = `role:${roleId}`
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey) // Kiểm tra key đã tồn tại trong cache chưa
    if (cachedRole === null) {
      const role = await this.prismaService.role
        .findUniqueOrThrow({
          where: {
            id: roleId,
            deletedAt: null,
            isActive: true,
          },
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        })
        .catch(() => {
          throw new ForbiddenException()
        })

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`,
      ) as CachedRole['permissions']
      cachedRole = { ...role, permissions: permissionObject }
      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60) // cache for 1 hour
      request[REQUEST_ROLE_PERMISSIONS] = role
    }
    const canAccess: Permission | undefined = cachedRole?.permissions[`${path}:${method}`]
    if (!canAccess) {
      throw new ForbiddenException()
    }
  }
}
