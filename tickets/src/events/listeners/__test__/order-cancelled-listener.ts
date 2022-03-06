import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@articks/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "cuehriasd",
    price: 20,
    userId: "23124",
  });
  // as it's for testing purpose, it's not recommended to change code just for testing so,
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

// best to separate them
it("updates the ticket, publishes an event and acks the msg", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();

  // better to view the arguments in mockfunction
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
