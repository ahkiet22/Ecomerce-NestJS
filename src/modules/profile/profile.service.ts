import { Injectable } from '@nestjs/common'
import { InvalidPasswordException, NotFoundRecordException } from 'src/common/error'
import { ChangePasswordBodyType, UpdateMeBodySchema, UpdateMeBodyType } from './profile.schema'
import { CommonUserRepository } from 'src/common/repositories/common-user.repository'
import { isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'
import { HashService } from 'src/libs/crypto/hash.service'

@Injectable()
export class ProfileService {
  constructor(
    private readonly commonUserRepository: CommonUserRepository,
    private readonly hashService: HashService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.commonUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    return user
  }

  async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
    try {
      return await this.commonUserRepository.update(
        { id: userId },
        {
          ...body,
          updatedById: userId,
        },
      )
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
    try {
      const { password, newPassword } = body
      const user = await this.commonUserRepository.findUnique({
        id: userId,
      })
      if (!user) {
        throw NotFoundRecordException
      }
      const isPasswordMatch = await this.hashService.compare(password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }
      const hashedPassword = await this.hashService.hash(newPassword)

      await this.commonUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      )
      return {
        message: 'Password changed successfully',
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}