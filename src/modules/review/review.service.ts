import { Injectable } from '@nestjs/common'
import { CreateReviewBodyType, UpdateReviewBodyType } from 'src/modules/review/review.schema'
import { ReviewRepository } from 'src/modules/review/review.repository'
import { PaginationQueryType } from 'src/common/models/request.model'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  list(productId: number, pagination: PaginationQueryType) {
    return this.reviewRepository.list(productId, pagination)
  }

  async create(userId: number, body: CreateReviewBodyType) {
    return this.reviewRepository.create(userId, body)
  }

  async update({ userId, reviewId, body }: { userId: number; reviewId: number; body: UpdateReviewBodyType }) {
    return this.reviewRepository.update({
      userId,
      reviewId,
      body,
    })
  }
}
