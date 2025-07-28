import { Injectable } from '@nestjs/common'
import { unlink } from 'fs/promises'
import { PresignedUploadFileBodyType } from './media.schema'
import { generateRandomFilename } from 'src/common/helpers/random-file-name'
import { S3Service } from 'src/common/services/s3.service'
@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadedFile({
            filename: 'images/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res.Location }
          })
      }),
    )
    // Xóa file sau khi upload lên S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path)
      }),
    )
    return {
      data: result,
    }
  }

  async getPresignUrl(body: PresignedUploadFileBodyType) {
    const randomFilename = generateRandomFilename(body.filename)
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename)
    const url = presignedUrl.split('?')[0]
    return {
      presignedUrl,
      url,
    }
  }
}
