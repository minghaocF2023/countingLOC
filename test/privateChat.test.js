import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import PrivateMessageFactory from '../src/models/privateMessageModel';

let mongoMemoryServer;
let PrivateMessage;

const { ObjectId } = mongoose.Types;

beforeAll(async () => {
  PrivateMessage = PrivateMessageFactory(mongoose);
});

beforeEach(async () => {
  mongoMemoryServer = new MongoMemoryServer();
  await mongoMemoryServer.start();
  const uri = await mongoMemoryServer.getUri();

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoMemoryServer.stop();
});

const mockdata = {
  chatroomId: new ObjectId('652e22af30ed27cbd32adf1a'),
  content: 'I want vacations',
  senderName: 'Laura',
  receiverName: 'Bob',
  timestamp: Date.now(),
  status: 'OK',
  isViewed: false,
};
describe('test privateChatModel', () => {
  test('get ALL private messages for a user', async () => {
    const message1 = new PrivateMessage(mockdata);
    const message2 = new PrivateMessage({ ...mockdata, receiverName: 'Leo' });
    await message1.save();
    await message2.save();

    const lauraAllMessage = await PrivateMessage.get({ senderName: 'Laura' });
    expect(lauraAllMessage.length).toBe(2);
  });

  test('get ONE private messages for a user', async () => {
    const message1 = new PrivateMessage(mockdata);
    await message1.save();

    const singleMessage = await PrivateMessage.getOne({ senderName: 'Laura' });
    expect(singleMessage).not.toBeNull();
    expect(singleMessage.getSenderName()).toBe('Laura');
    expect(singleMessage.getReceiverName()).toBe('Bob');
    expect(singleMessage.getText()).toBe('I want vacations');
  });

  test('markedAsViewed(messageId) should let message.isViewed become true', async () => {
    const message1 = new PrivateMessage(mockdata);
    await message1.save();

    const message = await PrivateMessage.getOne({ senderName: 'Laura' });
    expect(message.getIsViewed()).toBe(false);
    // eslint-disable-next-line no-underscore-dangle
    await PrivateMessage.markedAsViewed(message._id);
    const messageAfterViewed = await PrivateMessage.getOne({ senderName: 'Laura' });
    expect(messageAfterViewed.getIsViewed()).toBe(true);
  });

  test('get all messages from a sender to a receiver', async () => {
    const message1 = new PrivateMessage({ ...mockdata, receiverName: 'Lily', content: 'Hi' });
    const message2 = new PrivateMessage({ ...mockdata, receiverName: 'Lily', content: 'I want eat delicious food' });
    await message1.save();
    await message2.save();

    const lauraAllMessages = await PrivateMessage.getMsgFromSenderReceiver({ username: 'Laura' }, { username: 'Lily' });
    expect(lauraAllMessages.length).toBe(2);
  });
});
