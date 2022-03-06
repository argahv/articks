import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@articks/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = queueGroupName;

  // Here, the version of the ticket will be checked by event handler and if 'previousVersion' is not equal to 'version-1' the the data will be returned back and as it has not been '**acknowledged** it will be tried again for other service for 3rd event/2nd update

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    // find the previous ticket 'version' for optimal concurrency
    const ticket = await Ticket.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // if manually done pull of **version** and add it to set

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
