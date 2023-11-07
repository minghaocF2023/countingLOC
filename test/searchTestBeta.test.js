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

/** 
 * Test for stop word rule
*/
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

describe('Search announcements with mock db', () => {
  const mockDatabase = [
    { content: 'announcement 1', senderName: 'Jerry', timestamp: new Date('2023-11-01') },
    { content: 'not important message 1', senderName: 'Jerry', timestamp: new Date('2023-11-02') },
    { content: 'announcement 2', senderName: 'Jerry', timestamp: new Date('2023-11-06') },
    { content: 'not important message 2', senderName: 'Jerry', timestamp: new Date('2023-11-03') },
  ];

  it('return matching announcement messages', async () => {
    const mockSearchQuery = { words: 'announcement' };
    const mockAnnouncementModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(), 
      skip: jest.fn().mockReturnThis(), 
      limit: jest.fn().mockImplementation(() => {
        const regex = new RegExp(mockSearchQuery.words, 'i');
        const filteredData = mockDatabase.filter(item => regex.test(item.content));
        return Promise.resolve(filteredData);
      })
    };
    const searchAnnouncementStrategy = new SearchAnnouncements(mockAnnouncementModel);
    const result = await searchAnnouncementStrategy.execute(mockSearchQuery);
    
    assert.strictEqual(mockAnnouncementModel.find.mock.calls.length, 1);
    console.log(mockAnnouncementModel.find.mock.calls[0][0].content);
    // assert.deepStrictEqual(mockAnnouncementModel.find.mock.calls[0][0].content, mockSearchQuery.words);
    // console.log('---displaying result---\n', result);
    assert(result.length === 2, 'should return two announcements');
    assert(result[0].content.includes('announcement'), 'result should include the word in mockSearchQuery');
    assert(result[1].content.includes('announcement'), 'result should include the word in mockSearchQuery');
  });
  it('return empty list if there are not matching messages', async () => {
    const mockSearchQuery = { words: 'her' };
    const mockAnnouncementModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(), 
      skip: jest.fn().mockReturnThis(), 
      limit: jest.fn().mockImplementation(() => {
        const regex = new RegExp(mockSearchQuery.words, 'i');
        const filteredData = mockDatabase.filter(item => regex.test(item.content));
        return Promise.resolve(filteredData);
      })
    };
    const searchAnnouncementStrategy = new SearchAnnouncements(mockAnnouncementModel);
    const result = await searchAnnouncementStrategy.execute(mockSearchQuery);
    assert.strictEqual(mockAnnouncementModel.find.mock.calls.length, 0);
    // console.log(mockAnnouncementModel.find.mock.calls.content);
    assert(result.length === 0, 'should return empty list');
  })
});
