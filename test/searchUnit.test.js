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

/** 
* Test for search citizens general rule
*/
describe('Search citizens with mock db', () => {
  const testCitizen1 = {
    username: 'citizentest1',
    password: 'password',
    salt: 'salt',
    chatrooms: [],
    isOnline: true,
    status: 'OK',
    statusTimestamp: new Date('2023-11-01'),
  }
  const testCitizen2 = {
    username: 'citizentest2',
    password: 'password',
    salt: 'salt',
    chatrooms: [],
    isOnline: true,
    status: 'Help',
    statusTimestamp: new Date('2023-11-04'),
  }
  const testCitizen3 = {
    username: 'jerrytest',
    password: 'password',
    salt: 'salt',
    chatrooms: [],
    isOnline: true,
    status: 'Help',
    statusTimestamp: new Date('2023-11-02'),
  }
  const mockDatabase = [
    testCitizen1,
    testCitizen2,
    testCitizen3,
  ];
  
  describe('Search by citizen username', () => {
    it('search citizen by username where there are matching entries', async () => {
      const mockSearchQueryUser  = { username: 'jerry' };
      // const mockSearchQueryStatus  = { status: 'OK' };
      const mockUserModel = {
        find: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(), 
        limit: jest.fn().mockImplementation(() => {
          const regex = new RegExp(mockSearchQueryUser.username, 'i');
          const filteredData = mockDatabase.filter(item => regex.test(item.username));
          return Promise.resolve(filteredData);
        })
      };
      const searchCitizenStrategy = new SearchCitizens(mockUserModel);
      const result = await searchCitizenStrategy.execute(mockSearchQueryUser,10,1);
      assert(result.length === 1, 'should return 1 user because only one user contains word jerry');
      expect(result[0].username).toMatch(/jerry/i);
    });
    
    it('search citizen by username where there are no matching entries', async () => {
      const mockSearchQueryUser  = { username: 'bob' };
      // const mockSearchQueryStatus  = { status: 'OK' };
      const mockUserModel = {
        find: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(), 
        limit: jest.fn().mockImplementation(() => {
          const regex = new RegExp(mockSearchQueryUser.username, 'i');
          const filteredData = mockDatabase.filter(item => regex.test(item.username));
          return Promise.resolve(filteredData);
        })
      };
      const searchCitizenStrategy = new SearchCitizens(mockUserModel);
      const result = await searchCitizenStrategy.execute(mockSearchQueryUser);
      assert(result.length === 0, 'should return 1 user because only one user contains word jerry');
    });
  });
  describe('Search by citizen status', () => {
    it('search citizen by status where there are matching entries', async () => {
      const mockSearchQueryStatus  = { status: 'OK' };
      const mockUserModel = {
        find: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(), 
        limit: jest.fn().mockImplementation(() => {
          const regex = new RegExp(mockSearchQueryStatus.status, 'i');
          const filteredData = mockDatabase.filter(item => regex.test(item.status));
          return Promise.resolve(filteredData);
        })
      };
      const searchCitizenStrategy = new SearchCitizens(mockUserModel);
      const result = await searchCitizenStrategy.execute(mockSearchQueryStatus);
      assert(result.length === 1, 'should return 1 user because only one user is OK');
    });
     
    it('search citizen by status where there are no matching entries', async () => {
      const mockSearchQueryStatus  = { status: 'Undefined' };
      const mockUserModel = {
        find: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(), 
        limit: jest.fn().mockImplementation(() => {
          const regex = new RegExp(mockSearchQueryStatus.status, 'i');
          const filteredData = mockDatabase.filter(item => regex.test(item.status));
          return Promise.resolve(filteredData);
        })
      };
      const searchCitizenStrategy = new SearchCitizens(mockUserModel);
      const result = await searchCitizenStrategy.execute(mockSearchQueryStatus);
      assert(result.length === 0, 'should return 0 user because no user is undefined');
    });
  })
})

/** 
* Test for search announcement general rule
*/
describe('Search announcements with mock db', () => {
  const mockDatabase = [
    { content: 'announcement 1', senderName: 'Jerry', timestamp: new Date('2023-11-01') },
    { content: 'announcement 2', senderName: 'Jerry', timestamp: new Date('2023-11-06') },
    { content: 'not important message 1', senderName: 'Jerry', timestamp: new Date('2023-11-02') },
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

/** 
* Test for search public chat general rule
*/
describe('Search public chat with mock db', () => {
  const mockDatabase = [
    { content: 'public message 1', senderName: 'Jerry', timestamp: new Date('2023-11-01'), status: 'OK' },
    { content: 'public message 2', senderName: 'Jerry', timestamp: new Date('2023-11-06'), status: 'OK' },
    { content: 'not important text', senderName: 'Jerry', timestamp: new Date('2023-11-02'), status: 'Help' },
    { content: 'emoji happy', senderName: 'Jerry', timestamp: new Date('2023-11-03'), status: 'Emergency' },
  ];
  it('return matching public messages', async () => {
    const mockSearchQuery = { words: 'public message' };
    const mockPublicMessageModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(), 
      skip: jest.fn().mockReturnThis(), 
      limit: jest.fn().mockImplementation(() => {
        const regex = new RegExp(mockSearchQuery.words, 'i');
        const filteredData = mockDatabase.filter(item => regex.test(item.content));
        return Promise.resolve(filteredData);
      })
    };
    const searchPublicMessageStrategy = new SearchPublicMessage(mockPublicMessageModel);
    const result = await searchPublicMessageStrategy.execute(mockSearchQuery);
    
    assert.strictEqual(mockPublicMessageModel.find.mock.calls.length, 1);
    console.log(mockPublicMessageModel.find.mock.calls[0][0].content);
    // assert.deepStrictEqual(mockAnnouncementModel.find.mock.calls[0][0].content, mockSearchQuery.words);
    // console.log('---displaying result---\n', result);
    assert(result.length === 2, 'should return two announcements');
    assert(result[0].content.includes('public message'), 'result should include the word in mockSearchQuery');
    assert(result[1].content.includes('public message'), 'result should include the word in mockSearchQuery');
  });
  it('return matching public messages', async () => {
      const mockSearchQuery = { words: 'her' };
      const mockPublicMessageModel = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(), 
        skip: jest.fn().mockReturnThis(), 
        limit: jest.fn().mockImplementation(() => {
          const regex = new RegExp(mockSearchQuery.words, 'i');
          const filteredData = mockDatabase.filter(item => regex.test(item.content));
          return Promise.resolve(filteredData);
        })
      };
      const searchPublicMessageStrategy = new SearchPublicMessage(mockPublicMessageModel);
      const result = await searchPublicMessageStrategy.execute(mockSearchQuery);
      
      assert.strictEqual(mockPublicMessageModel.find.mock.calls.length, 0);
      console.log(mockPublicMessageModel.find.mock.calls.content);
      // assert.deepStrictEqual(mockAnnouncementModel.find.mock.calls[0][0].content, mockSearchQuery.words);
      // console.log('---displaying result---\n', result);
      assert(result.length === 0, 'should return empty list of public messages');
    });
});

/** 
* Test for search private messages general rule
*/
describe('Search private messages with mock db', () => {
  const mockDatabase = [
    { content: 'message 1', senderName: 'Jerry', receiverName: 'Laura', status: 'Help', isNotified: true, isViewed: true, timestamp: new Date('2023-11-01'), isViewed: true },
    { content: 'message 2', senderName: 'Jerry', receiverName: 'Laura', status: 'OK', isNotified: true, isViewed: true, timestamp: new Date('2023-11-01'), isViewed: true },
    { content: 'message 3', senderName: 'Jerry', receiverName: 'Laura', status: 'Help', isNotified: true, isViewed: true, timestamp: new Date('2023-11-01'), isViewed: true },
    { content: 'private message 4', senderName: 'Jerry', receiverName: 'Laura', status: 'Emergency', isNotified: true, isViewed: true, timestamp: new Date('2023-11-01'), isViewed: true },,
  ];

  it('return matching private messages between userA-Jerry and userB-Laura', async () => {
    const mockSearchQuery = {  words: 'message', userA: 'Jerry', userB: 'Laura' };
    const pageSize = 10;
    const pageNum = 1;
    const mockPrivateMessageModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(), 
      skip: jest.fn().mockReturnThis(), 
      limit: jest.fn().mockImplementation(() => {
        const regex = new RegExp(mockSearchQuery.words, 'i');
        const filteredData = mockDatabase.filter(item => regex.test(item.content));
        return Promise.resolve(filteredData);
      })
    };
    const searchPrivateStrategy = new SearchPrivateMessage(mockPrivateMessageModel);
    const result = await searchPrivateStrategy.execute(mockSearchQuery);
    
    assert.strictEqual(mockPrivateMessageModel.find.mock.calls.length, 1);

    assert(result.length === 4, 'should return 4 private messages');
  });
  
  it('return status change', async () => {
    const mockSearchQuery = {  words: 'status', userA: 'Jerry', userB: 'Laura' };
    const pageSize = 10;
    const pageNum = 1;
    const mockPrivateMessageModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(), 
      skip: jest.fn().mockReturnThis(), 
      limit: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockDatabase
          .filter(item => item.senderName === mockSearchQuery.userA && item.receiverName === mockSearchQuery.userB)
          .sort((a, b) => b.timestamp - a.timestamp) 
          .slice(0, pageSize)); 
      })
    };
    const searchPrivateStrategy = new SearchPrivateMessage(mockPrivateMessageModel);
    const result = await searchPrivateStrategy.execute(mockSearchQuery);
    
    assert.strictEqual(mockPrivateMessageModel.find.mock.calls.length, 1);
    assert(result.length === 4, 'should detect 4 status change');
  });
});