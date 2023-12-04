import ShelterController from '../src/controllers/shelterController.js';
import authChecker from '../src/utils/authChecker.js';

describe('Unit tests for shelter feature', () => {
  let shelterController;
  let ShelterModel;
  let mockReq; let
    mockRes;

  beforeEach(() => {
    ShelterModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
    };

    authChecker.checkAuth = jest.fn().mockImplementation((req, res, next) => {
      req.user = { id: 'mockUserId' }; // Mock user object if needed
    });

    // Mock request and response
    mockReq = {
      headers: {
        authorization: 'Some secret keys',
      },
      params: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    shelterController = new ShelterController({}, ShelterModel);
  });

  it('fetch all shelters in the database', async () => {
    ShelterModel.find.mockResolvedValue(['shelter1', 'shelter2']);
    await shelterController.getAllShelters(mockReq, mockRes);
    console.log(`printing....${mockRes.json}`);
    expect(mockRes.json.mock.calls.length).toBe(1);
  });

  it('handles no shelters found', async () => {
    ShelterModel.find.mockResolvedValue([]);
    await shelterController.getAllShelters(mockReq, mockRes);
    // Check if json method is called
    expect(mockRes.json).toHaveBeenCalled();

    // Inspect the argument structure passed to json
    const jsonResponse = mockRes.json.mock.calls[0][0];
    expect(jsonResponse).toHaveProperty('data');

    // Now check the length of data
    expect(jsonResponse.data).toHaveLength(0);
  });

  it('updates an existing shelter', async () => {
    const updatedShelter = { name: 'Updated Shelter' };
    ShelterModel.findByIdAndUpdate.mockResolvedValue(updatedShelter);
    mockReq.params.shelterId = '123';
    mockReq.body = updatedShelter;
    await shelterController.updateShelter(mockReq, mockRes);
    expect(mockRes.json.mock.calls[0][0].data).toEqual(updatedShelter);
  });

  it('handles update for non-existing shelter', async () => {
    ShelterModel.findByIdAndUpdate.mockResolvedValue(null);
    mockReq.params.shelterId = 'nonExistingId';
    await shelterController.updateShelter(mockReq, mockRes);
    expect(mockRes.status.mock.calls[0][0]).toBe(404); // assuming 404 is used for Not Found
  });

  it('deletes an existing shelter', async () => {
    ShelterModel.findByIdAndDelete.mockResolvedValue({ _id: '123' });
    mockReq.params.shelterId = '123';
    await shelterController.deleteShelter(mockReq, mockRes);
    expect(mockRes.status.mock.calls[0][0]).toBe(200); // assuming 200 for successful deletion
  });

  it('handles delete for non-existing shelter', async () => {
    ShelterModel.findByIdAndDelete.mockResolvedValue(null);
    mockReq.params.shelterId = 'nonExistingId';
    await shelterController.deleteShelter(mockReq, mockRes);
    expect(mockRes.status.mock.calls[0][0]).toBe(404); // assuming 404 for Not Found
  });

  it('fetches a specific shelter by ID', async () => {
    const shelter = { _id: '123', name: 'Specific Shelter' };
    ShelterModel.findById.mockResolvedValue(shelter);
    mockReq.params.shelterId = '123';
    await shelterController.getShelterById(mockReq, mockRes);
    expect(mockRes.json.mock.calls[0][0].data).toEqual(shelter);
  });

  it('handles fetch for non-existing shelter by ID', async () => {
    ShelterModel.findById.mockResolvedValue(null);
    mockReq.params.shelterId = 'nonExistingId';
    await shelterController.getShelterById(mockReq, mockRes);
    expect(mockRes.status.mock.calls[0][0]).toBe(404); // assuming 404 for Not Found
  });
});
