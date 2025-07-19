import { Global, Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'
import envConfig from 'src/configs/validation'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    const subject = 'Email Verification'
    const otpTemplate = fs.readFileSync(path.resolve('src/libs/email/templates/otp.html'), 'utf8')
    const htmlContent = otpTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{code}}', payload.code)
      .replaceAll('{{email}}', payload.email)

    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: [envConfig.EMAIL_SEND_OTP],
      subject,
      html: htmlContent,
    })
  }
}
