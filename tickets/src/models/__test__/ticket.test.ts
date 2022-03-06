import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  // Create instance of a ticket
  const ticket = Ticket.build({
    title: "convert",
    price: 4,
    userId: "123",
  });

  // Save the ticket to the db
  await ticket.save();

  // fetch the ticket twice

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }

  throw new Error("Should not react this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "sda",
    price: 2412,
    userId: "asdas",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
