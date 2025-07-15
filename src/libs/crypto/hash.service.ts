import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'

@Injectable()
export class HashService {
  private readonly saltRounds = 10
  async hash(value: string) {
    return await bcrypt.hash(value, this.saltRounds)
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hashed)
  }
}
