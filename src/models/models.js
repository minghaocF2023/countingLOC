import AnnouncementFactory from './announcementModel.js';
import ChatroomFactory from './chatroomModel.js';
import PrivateMessageFactory from './privateMessageModel.js';
import PublicMessageFactory from './publicMessageModel.js';
import UserFactory from './userModel.js';
import ShelterFactory from './shelterModel.js';
import AppointmentFactory from './appointmentModel.js';
import MedicineFactory from './medicineModel.js';
import RequestFactory from './requestModel.js';
import EmergencyEventFactory from './emergencyEvent.js';

import { realConnection, testConnection } from '../services/db.js';
import ProfileFactory from './profileModel.js';

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
const appointmentModel = AppointmentFactory(realConnection);
const testAppointmentModel = AppointmentFactory(testConnection);
const medicineModel = MedicineFactory(realConnection);
const testMedicineModel = MedicineFactory(testConnection);
const requestModel = RequestFactory(realConnection);
const testRequestModel = RequestFactory(testConnection);
const emergencyEventModel = EmergencyEventFactory(realConnection);
const testEmergencyEventModel = EmergencyEventFactory(testConnection);

const ProfileModel = ProfileFactory(realConnection);
const testProfileModel = ProfileFactory(testConnection);
export {
  userModel,
  testUserModel,
  chatroomModel,
  testChatroomModel,
  privateMessageModel,
  testPrivateMessageModel,
  ProfileModel,
  testProfileModel,
  publicMessageModel,
  testPublicMessageModel,
  announcementModel,
  testAnnouncementModel,
  shelterModel,
  testShelterModel,
  appointmentModel,
  testAppointmentModel,
  medicineModel,
  testMedicineModel,
  requestModel,
  testRequestModel,
  emergencyEventModel,
  testEmergencyEventModel,
};
