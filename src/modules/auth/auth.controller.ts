import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AccessTokenGuard } from 'src/common/guards/access-token.guard'
import { RegisterBodyDto, RegisterResDto } from './dto/register-auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { SendOTPBodyDto } from './dto/send-otp.dto'
import { LoginBodyDto } from './dto/login-auth.dto'
import { Request } from 'express'
import { UserAgent } from 'src/common/decorators/user-agent.decorator'
import { IP } from 'src/common/decorators/ip.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body)
  }

  @Post('otp')
  sendOTP(@Body() body: SendOTPBodyDto) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @IP() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: any) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: any) {
    return this.authService.logout(body.refreshToken)
  }
}
