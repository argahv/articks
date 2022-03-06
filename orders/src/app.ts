import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@articks/common";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";
import { createOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(createOrderRouter);
app.use(indexOrderRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
