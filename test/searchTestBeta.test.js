// Search unit test
// stop word rule -- at least 2, make sure the return list is empty
// 1. search announcement stop words
// 2. search public message stop words
// 3. search private message stop words

// search rule -- at least 10
// 1. list of citizens by status x2
// 2. list of citizens by name x2
// 3. list of announcements x2
// 4. list of pulbic message x2
// 5. list of private message x2
import assert from 'assert';
import {
  SearchCitizens,
  SearchAnnouncements,
  SearchPublicMessage,
  SearchPrivateMessage,
} from '../src/models/searchStrategy';

describe('Search with stop words', () => {
  describe('SearchAnnouncements', () => {
    it('test case which should return empty list if the search keyword is a stop word', async () => {
      const mockAnnouncementModel = { find: jest.fn() };
      const searchStrategy = new SearchAnnouncements(mockAnnouncementModel);
      const result = await searchStrategy.execute({ words: 'a' }, 10, 1);
      assert(mockAnnouncementModel.find.mock.calls.length === 0);
      assert.deepStrictEqual(result, []);
    });
  });
  describe('SearchPublicMessage', () => {
    it('test case which should return empty list if the search keyword is a stop word', async () => {
      const mockPublicMessageModel = { find: jest.fn() };
      const searchStrategy = new SearchPublicMessage(mockPublicMessageModel);
      const result = await searchStrategy.execute({ words: 'been' }, 10, 1);
      assert(mockPublicMessageModel.find.mock.calls.length === 0);
      assert.deepStrictEqual(result, []);
    });
  });
  describe('SearchPrivateMessage', () => {
    it('test case which should return empty list if the search keyword is a stop word', async () => {
      const mockPrivateMessageModel = { find: jest.fn() };
      const searchStrategy = new SearchPrivateMessage(mockPrivateMessageModel);
      const result = await searchStrategy.execute({ words: 'should' }, 10, 1);
      assert(mockPrivateMessageModel.find.mock.calls.length === 0);
      assert.deepStrictEqual(result, []);
    });
  });
});
