import privateChatController from '../src/controllers/privateChatController.js';
import { PrivateMessage, Chatroom, User } from '../src/models/models.js';
import JWT from '../src/utils/jwt.js';

jest.mock('../src/models/models.js', () => ({
  PrivateMessage: {
    save: jest.fn(),
    get: jest.fn(),
    markedAsViewed: jest.fn(),
  },
}));

describe('getLatestMessageBetweenUsers', () => {
  const mockRequest = (params, query) => ({
    params,
    query,
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns messages between users', async () => {
    const req = mockRequest({ userA: 'Alice', userB: 'Bob' }, { isInChat: 'true' });
    const res = mockResponse();

    // Mock the returned messages from the database
    PrivateMessage.get.mockResolvedValue([
      {
        getChatroomID: jest.fn().mockReturnValue('1'),
        getText: jest.fn().mockReturnValue('Hello'),
        getSenderName: jest.fn().mockReturnValue('Alice'),
        getReceiverName: jest.fn().mockReturnValue('Bob'),
        getStatus: jest.fn().mockReturnValue('sent'),
        getTimestamp: jest.fn().mockReturnValue(new Date()),
        getIsViewed: jest.fn().mockReturnValue(false),
      },
    ]);

    PrivateMessage.markedAsViewed.mockResolvedValue(true);

    await privateChatController.getLatestMessageBetweenUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'OK',
      }),
    );
  });
});
