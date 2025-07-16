import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/common/constants/role.constant'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null
  constructor(private readonly prismaService: PrismaService) {}
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.Client,
      },
    })
    this.clientRoleId = role.id
    return this.clientRoleId
  }
}
