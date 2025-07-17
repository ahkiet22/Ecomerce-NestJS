import { PrismaService } from 'src/prisma/prisma.service'
import { UserType } from '../models/user.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CommonUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}
