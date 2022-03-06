export const stripe = {
  charges: {
    // promse that automatically resolves itself with empty object
    create: jest.fn().mockResolvedValue({}),
  },
};
