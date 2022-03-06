import mongoose from "mongoose";
import request from "supertest";
import { OrderStatus } from "@articks/common";
import { app } from "../../app";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// for realistic approach i.e contacting stripe api
// get access to the secret key
// env or other

jest.mock("../../stripe");

it("return a 404 when purchasing order that doesnt exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "sdasdq",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("return a 401 when purchasing order that doesnt belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "sdasdq",
      orderId: order.id,
    })
    .expect(401);
});

it("return a 400 when purchasing cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      orderId: order.id,
      token: "32131",
    })
    .expect(400);
});

it("returns a 204 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const price = Math.floor(Math.random() * 10000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  // real version of stripe
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("npr");

  // mocked version of stripe
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  // expect(chargeOptions.source).toEqual("tok_visa");
  // expect(chargeOptions.amount).toEqual(900 * 100);
  // expect(chargeOptions.currency).toEqual("npr");

  // find the related payment
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  // REMEMBER:returns null which will mark as found(success)
  expect(payment).not.toBeNull();
});
