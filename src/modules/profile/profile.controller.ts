import { Body, Controller, Get, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ProfileService } from './profile.service'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/common/dtos/shared-user.dto'
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from 'src/modules/profile/profile.dto'
import { ActiveUser } from 'src/common/decorators/active-user.decorator'
import { MessageResDto } from 'src/common/dtos/response.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put()
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.updateProfile({
      userId,
      body,
    })
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDto)
  changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword({
      userId,
      body,
    })
  }
}
