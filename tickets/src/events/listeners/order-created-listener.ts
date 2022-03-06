import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@articks/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if not ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as being reserved by setting its orderId

    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    // adding *await* to say it might go wrong somewhere

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    // ack the msg

    msg.ack();
  }
}
