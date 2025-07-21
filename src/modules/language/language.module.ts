import { Module } from '@nestjs/common'
import { LanguageController } from './language.controller'
import { LanguageRepo } from './language.repository'
import { LanguageService } from './language.service'

@Module({
  providers: [LanguageService, LanguageRepo],
  controllers: [LanguageController],
})
export class LanguageModule {}
