export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({
      id: 'test_charge_id'
    }),
  },
};