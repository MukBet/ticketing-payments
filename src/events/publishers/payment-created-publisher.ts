import { PaymentCreatedEvent, Publisher, Subjects } from '@motway_ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}