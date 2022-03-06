import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

interface TicketAttrs {
  title: string;
  id: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// // manually setting version addition
// ticketSchema.pre("save", function (done) {
//   // @ts-ignore
//   this.$where = {
//     // 1 represents the addition of version by 1 *can manually change to other values*
//     version: this.get("version") - 1,
//   };

//   done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    // to make sure _id changes to id but might not be the best approach
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.methods.isReserved = async function () {
  // this ===ticket document we called "isReserved" on

  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
