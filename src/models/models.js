import AnnouncementFactory from './announcementModel.js';
import ChatroomFactory from './chatroomModel.js';
import PrivateMessageFactory from './privateMessageModel.js';
import PublicMessageFactory from './publicMessageModel.js';
import UserFactory from './userModel.js';
import ShelterFactory from './shelterModel.js';

import { realConnection, testConnection } from '../services/db.js';

const userModel = UserFactory(realConnection);
const testUserModel = UserFactory(testConnection);
const chatroomModel = ChatroomFactory(realConnection);
const testChatroomModel = ChatroomFactory(testConnection);
const privateMessageModel = PrivateMessageFactory(realConnection);
const testPrivateMessageModel = PrivateMessageFactory(testConnection);
const publicMessageModel = PublicMessageFactory(realConnection);
const testPublicMessageModel = PublicMessageFactory(testConnection);
const announcementModel = AnnouncementFactory(realConnection);
const testAnnouncementModel = AnnouncementFactory(testConnection);
const shelterModel = ShelterFactory(realConnection);
const testShelterModel = ShelterFactory(testConnection);

export {
  userModel,
  testUserModel,
  chatroomModel,
  testChatroomModel,
  privateMessageModel,
  testPrivateMessageModel,
  publicMessageModel,
  testPublicMessageModel,
  announcementModel,
  testAnnouncementModel,
  shelterModel,
  testShelterModel,
};
