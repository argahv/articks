import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@articks/common";
import express, { Response, Request } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { Order, OrderStatus } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// change the status of the order to cancelled rather than deleting the whole order

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publising an event saying this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    // show delete
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
