import request from "supertest";
import { app } from '../../app';
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderStatus } from "@motway_ticketing/common";
import { stripe } from '../../stripe'; // Я знаю что тест падает. Ибо он на делает реальные данные и его надо до настроить, читай коммент в начале ИТ метода нижн.
import { Payment } from "../../models/payment";

// Оставил падающий тест как показатель что не обьязательно для деплоя все тесті должні пройти успешно. Десты и деплой на прод это разное. Хотя выпавшие тесты могут не давать деплоится, к примеру.
it('returns a 201 with valid inputs', async () => {
  // ЖИВОЙ тест с реальным Stripe API.
  // РАБОТАЕТ только если C:\Learning\microservices-with-node-js-and-react\ticketing\payments\src\__mocks__\stripe.ts файл не используется.
  // Я переименовал его с stripe.ts в stripe.old.ts чтобы использовать реальный Stripe в этом тесте.

  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });
  expect(payment).not.toBeNull();
});