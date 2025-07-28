import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import path from 'path'
import { IsPublic } from 'src/common/decorators/auth.decorator'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from 'src/modules/media/media.dto'
import { UPLOAD_DIR } from 'src/common/constants/other.constant'
import { MediaService } from './media.service'
import { ParseFilePipeWithUnlink } from './parse-file-pipe-with-unlink.pipe'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('images/upload')
  @ZodSerializerDto(UploadFilesResDTO)
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 1MB
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files)
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENPOINT}/${file.filename}`,
    // }))
  }

  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found')
        res.status(notfound.getStatus()).json(notfound.getResponse())
      }
    })
  }

  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @IsPublic()
  createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignUrl(body)
  }
}
