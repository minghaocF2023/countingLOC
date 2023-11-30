/* eslint-disable new-cap */
import ProfileController from '../src/controllers/profileController';
import authChecker from '../src/utils/authChecker';

jest.mock('../src/utils/authChecker');

describe('ProfileController Unit Test', () => {
  let profileController;
  let mockProfileModel;
  let mockUserModel;
  let req;
  let res;

  const mockRes = {
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
    jest.resetAllMocks();
    req = {
      params: {},
      body: {},
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
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
    profileController = new ProfileController(mockUserModel, mockProfileModel);
  });

  it('should successfully retrieve a user profile', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({ profileId: '123' });

    mockProfileModel.getOne.mockResolvedValue(mockRes);
    await profileController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ profile: mockRes });
  });

  it('should return 404 if profile not found', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({});

    await profileController.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should successfully retrieve a contact profile', async () => {
    mockUserModel.getUserProfileId.mockResolvedValue({ profileId: '123' });
    mockProfileModel.getOne.mockResolvedValue(mockRes);
    req.params.username = 'targetUser';
    await profileController.getContactProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ profile: mockRes });
  });

  it('should return 404 if contact profile not found', async () => {
    mockUserModel.getUserProfileId.mockResolvedValue({});
    req.params.username = 'targetUser';
    await profileController.getContactProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should show profile already exsist', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({ profileId: '123' });
    mockProfileModel.createNewProfile.mockResolvedValue(mockRes);
    mockUserModel.updateUserProfileId.mockResolvedValue();
    req.body.profile = mockRes;
    await profileController.postProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'profile already exsist' });
  });

  it('should successfully update a user profile', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({ profileId: '123' });
    mockProfileModel.updateProfileById.mockResolvedValue(mockRes);
    mockUserModel.updateUserProfileId.mockResolvedValue();
    req.body.profile = { ...mockRes, firstName: 'update' };
    await profileController.updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return 404 if profile to update is not found', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({});

    req.body.profile = { ...mockRes, firstName: 'update' };
    await profileController.updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('should return 404 if profile to delete is not found', async () => {
    authChecker.getAuthUsername.mockReturnValue('testUser');
    mockUserModel.getUserProfileId.mockResolvedValue({});

    req.body.profile = { ...mockRes, firstName: 'update' };
    await profileController.deleteProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
