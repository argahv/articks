import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  // name of the channel this listener is going to listern to
  abstract subject: T["subject"];

  // name of the queue group this listener will join
  abstract queueGroupName: string;

  // Function to run when a message is received
  abstract onMessage(data: T["data"], msg: Message): void;

  // pre-initialized NATS client
  private client: Stan;

  // number of seconds this listener has to ack a message
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  // Default subscription options
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  // Code to setup the subscription
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  // Helper function to parse the message
  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : // in case of Buffer
        JSON.parse(data.toString("utf-8"));
  }
}
