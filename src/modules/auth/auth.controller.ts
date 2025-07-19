import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
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
import { LoginBodyDto, LoginResDto } from './dto/login-auth.dto'
import { UserAgent } from 'src/common/decorators/user-agent.decorator'
import { RefreshTokenBodyDto, RefreshTokenResDto } from './dto/refresh-token.dto'
import { LogoutBodyDto } from './dto/logout.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body)
  }

  @Post('otp')
  sendOTP(@Body() body: SendOTPBodyDto) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResDto)
  login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDto)
  refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    })
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: LogoutBodyDto) {
    return this.authService.logout({ refreshToken: body.refreshToken })
  }
}
