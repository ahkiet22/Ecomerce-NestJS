import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Get,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
  Res,
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
import { MessageResDto } from 'src/common/dtos/response.dto'
import { IsPublic } from 'src/common/decorators/auth.decorator'
import { GoogleService } from './google.service'
import { GetAuthorizationUrlResDto } from './dto/google-o2auth.dto'
import { Response } from 'express'
import envConfig from 'src/configs/validation'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body)
  }

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  sendOTP(@Body() body: SendOTPBodyDto) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @IsPublic()
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
  // @UseGuards(AccessTokenGuard)
  // @IsPublic()
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

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ code, state })

      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }
}
