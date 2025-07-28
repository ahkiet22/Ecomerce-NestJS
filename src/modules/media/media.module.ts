import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { existsSync, mkdirSync } from 'fs'
import multer from 'multer'
import { UPLOAD_DIR } from 'src/common/constants/other.constant'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'
import { generateRandomFilename } from 'src/common/helpers/random-file-name'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const newFilename = generateRandomFilename(file.originalname)
    cb(null, newFilename)
  },
})

@Module({
  providers: [MediaService],
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
  controllers: [MediaController],
})
export class MediaModule {
  constructor() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }
  }
}
