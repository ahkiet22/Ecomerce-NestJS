import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import z from 'zod'

config({
  path: '.env',
})

// check file .env
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Not found file .env')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  BASE_URL_CLIENT: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONENUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_SEND_OTP: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_CLIENT_REDIRECT_URI: z.string(),
  APP_NAME: z.string(),
  S3_REGION: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_ENPOINT: z.string(),
  S3_BUCKET_NAME: z.string(),
  PAYMENT_API_KEY: z.string(),
  REDIS_URL: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.log('The declared values in the .evn file are invalid.')
  console.log(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
