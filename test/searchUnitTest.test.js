import { SearchAnnouncements } from '../src/models/searchStrategy';

// Mock the announcementModel used within SearchAnnouncements
const mockAnnouncementModel = {
  find: jest.fn(),
};

describe('SearchAnnouncements Stop Words Handling', () => {
  let searchAnnouncements;

  beforeEach(() => {
    // Reset the mock before each test
    mockAnnouncementModel.find.mockReset();
    searchAnnouncements = new SearchAnnouncements(mockAnnouncementModel);
  });

  test('No results are returned when search criteria include only stop words', async () => {
    const queryParams = { words: 'me because you' }; // Only stop words
    const pageSize = 10;
    const pageNum = 1;

    // Mock the find method to mimic no results found
    mockAnnouncementModel.find.mockResolvedValue([]);

    const results = await searchAnnouncements.execute(queryParams, pageSize, pageNum);
    // Expect no results to be returned
    expect(results).toEqual([]);
    // Expect find method to not have been called since only stop words are present
    expect(mockAnnouncementModel.find).not.toHaveBeenCalled();
  });

  test('Results are returned when search criteria include non-stop words', async () => {
    const queryParams = { words: 'about bug' }; // Includes a non-stop word
    const pageSize = 10;
    const pageNum = 1;

    // Mock the find method to mimic found results
    const mockResults = [{ _id: '123', content: 'it is about a bug.' }];
    mockAnnouncementModel.find.mockResolvedValue(mockResults);

    const results = await searchAnnouncements.execute(queryParams, pageSize, pageNum);

    // Expect results to be returned
    expect(results).toEqual(mockResults);
    // Ensure the find method was called
    expect(mockAnnouncementModel.find).toHaveBeenCalled();
  });
});
