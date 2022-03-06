import { TicketCreatedEvent } from "@articks/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create a instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "sdasd",
    price: 102,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake Message(msg) object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  //   Write assertion to make sure ack function is called

  expect(msg.ack).toHaveBeenCalled();
});
