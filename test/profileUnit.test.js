import ejs from 'ejs';
import MailAlertController from '../src/controllers/mailAlertController.js';
import transporter from '../src/utils/mailer.js';
import authChecker from '../src/utils/authChecker.js';

jest.mock('../src/utils/authChecker.js');
jest.mock('ejs');
jest.mock('../src/utils/mailer.js');

describe('mailController Unit Test', () => {
  let mailAlertController;
  let mockProfileModel;
  let mockUserModel;
  let req;
  let res;
  const mockProfile = {
    _id: '123',
    firstName: 'Leo',
    lastName: 'Bot',
    profileImage: 'https://cdn.custom-cursor.com/cursors/pack2195.png',
    birthdate: '01/01/2023',
    phone: '6500000000',
    email: 'leobot@andrew.cmu.edu',
    drugAllergy: [
      'ibuprofen',
    ],
    healthCondition: [
      'Lung Cancer',
    ],
    pronoun: 'Bot',
    doctorEmail: 'drleo@andrew.cmu.edu',
  };
  beforeEach(() => {
    mockProfileModel = {
      getOne: jest.fn(),
      createNewProfile: jest.fn(),
      updateProfileById: jest.fn(),
      deleteProfileById: jest.fn(),
    };
    mockUserModel = {
      getUserProfileId: jest.fn(),
      updateUserProfileId: jest.fn(),
    };
    mailAlertController = new MailAlertController(mockUserModel, mockProfileModel);
    req = { body: {}, app: { get: jest.fn() } };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  });

  it('should return 404 if profile not found', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({});

    await mailAlertController.sendMailAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'profile not found' });
  });

  it('should send an email successfully', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({ profileId: '123' });
    mockProfileModel.getOne.mockResolvedValue(mockProfile);
    ejs.renderFile.mockImplementation((template, data, callback) => callback(null, 'email content'));
    transporter.sendMail.mockImplementation((mailOptions, callback) => callback(null));

    req.app.get.mockReturnValue('/path/to/views/template'); // Mock for template path

    await mailAlertController.sendMailAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OK' });
  });
});
