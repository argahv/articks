import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
  // Create a ticket
  const ticket = await Ticket.build({
    title: "title",
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 29,
  });

  await ticket.save();

  const user = global.signin();
  // make request to  build an order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);

  // TODO: show 404 if not found
});

it("return an error if one user tries to fetch other user's order", async () => {
  // Create a ticket
  const ticket = await Ticket.build({
    title: "title",
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 29,
  });

  await ticket.save();

  const user = global.signin();
  // make request to  build an order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);

  // TODO: show 404 if not found
});
