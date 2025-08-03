import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/common/constants/queue.constant'
import { CommonPaymentRepository } from 'src/common/repositories/common-payment.repository'

@Processor(PAYMENT_QUEUE_NAME)
export class PaymentConsumer extends WorkerHost {
  constructor(private readonly commonPaymentRepository: CommonPaymentRepository) {
    super()
  }
  async process(job: Job<{ paymentId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        const { paymentId } = job.data
        await this.commonPaymentRepository.cancelPaymentAndOrder(paymentId)
        return {}
      }
      default: {
        break
      }
    }
  }
}
