/* eslint-disable max-classes-per-file */
// SearchStrategy interface

const filterSearchInput = (words, searchStategy) => {
  const splitWords = words.split(/\s+/);
  const searchWords = splitWords.filter((word) => !searchStategy.isStopWord(word));
  return searchWords;
};

class SearchStrategy {
  constructor() {
    // Initialize stopWords as a Set
    this.stopWords = new Set([
      'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among',
      'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by',
      'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever',
      'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers',
      'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just',
      'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my',
      'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other',
      'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so',
      'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
      'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what',
      'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
      'yet', 'you', 'your',
    ]);
  }

  /**
   * @param {Object} queryParams
   * @param {number} pageSize
   * @param {number} pageNum
   */
  execute(queryParams, pageSize, pageNum) {
    throw new Error(`${this.constructor.name}.execute() is not implemented`);
  }

  isStopWord(word) {
    return this.stopWords.has(word.toLowerCase());
  }

  filterSearchInput(words) {
    const splitWords = words.split(/\s+/);
    return splitWords.filter((word) => !this.isStopWord(word));
  }

  static escapeRE(string) {
    if (!string) return string;
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static createRE(string, ...flags) {
    return new RegExp(SearchStrategy.escapeRE(string), ...flags);
  }
}

// Concrete strategy for searching citizens by username
export class SearchCitizens extends SearchStrategy {
  constructor(userModel) {
    super();
    this.userModel = userModel;
  }

  /**
   * @param {{username: string, status: string}} queryParams
   * @param {number} pageSize
   * @param {number} pageNum
   */
  async execute(queryParams, pageSize = 0, pageNum = 1) {
    const { username, status } = queryParams;
    const query = {
      username: SearchStrategy.createRE(username, 'i'),
      status: SearchStrategy.createRE(status, 'i'),
    };
    return this.userModel.find(query)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
  }
}

export class SearchAnnouncements extends SearchStrategy {
  constructor(announcementModel) {
    super();
    this.announcementModel = announcementModel;
  }

  /**
   * @param {{words: string}} queryParams
   * @param {number} pageSize
   * @param {number} pageNum
   */
  async execute(queryParams, pageSize = 10, pageNum = 1) {
    // Check if keywords are not only stop words
    console.log(`current queryParams is: ${queryParams} and queryParam's content is ${queryParams.content}`);
    const { words } = queryParams;
    const splitWords = words.split(/\s+/);
    const searchWords = splitWords.filter((word) => !this.isStopWord(word));
    if (searchWords.length === 0) {
      return [];
    }
    const searchQuery = {
      content: SearchStrategy.createRE(searchWords.join('|'), 'i'),
    };

    const results = await this.announcementModel.find(searchQuery)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('sender');

    const ret = results.map((r) => ({
      ...r.toObject(),
      senderName: r.sender.username,
    }));

    return ret;
  }
}

export class SearchPublicMessage extends SearchStrategy {
  constructor(publicMessageModel) {
    super();
    this.publicMessageModel = publicMessageModel;
  }

  /**
   * @param {{words: string}} queryParams
   * @param {number} pageSize
   * @param {number} pageNum
   */
  async execute(queryParams, pageSize = 10, pageNum = 1) {
    const { words } = queryParams;
    const searchWords = filterSearchInput(words, this);

    if (searchWords.length === 0) {
      // If the search words are only stop words, return an empty array.
      return [];
    }

    // Construct the regex search query.
    const searchQuery = {
      content: SearchStrategy.createRE(searchWords.join('|'), 'i'),
    };

    // Execute the query and return the results.
    const results = await this.publicMessageModel.find(searchQuery)
      .sort({ timestamp: -1 }) // Ensure messages are returned in reverse chronological order.
      .skip((pageNum - 1) * pageSize) // Skip the correct number of documents for pagination.
      .limit(pageSize) // Limit the number of documents returned to the page size.
      .populate('sender');

    const ret = results.map((r) => ({
      ...r.toObject(),
      senderName: r.sender.username,
    }));

    return ret;
  }
}

export class SearchPrivateMessage extends SearchStrategy {
  constructor(privateMessageModel, userModel) {
    super();
    this.privateMessageModel = privateMessageModel;
    this.userModel = userModel;
  }

  /**
   * @param {{words: string, userA: string, userB: string}} queryParams
   * @param {number} pageSize
   * @param {number} pageNum
   */
  async execute(queryParams, pageSize = 10, pageNum = 1) {
    const { words, userA, userB } = queryParams;
    const searchWords = filterSearchInput(words, this);
    const isSearchingStatus = searchWords.length === 1 && searchWords[0] === 'status';
    if (searchWords.length === 0) {
      // If the search words are only stop words, return an empty array.
      return [];
    }

    const userAId = await this.userModel.getIdByUsername(userA);
    const userBId = await this.userModel.getIdByUsername(userB);
    if (!userAId || !userBId) {
      return [];
    }

    // Construct the regex search query.
    const searchQuery = isSearchingStatus
      ? { sender: userAId, receiver: userBId }
      : {
        $or: [
          { sender: userAId, receiver: userBId },
          { sender: userBId, receiver: userAId },
        ],
        content: SearchStrategy.createRE(searchWords.join('|'), 'i'),
      };

    // Execute the query and return the results.
    const result = await this.privateMessageModel.find(searchQuery)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('sender receiver');

    const statusList = [];
    if (isSearchingStatus) {
      result.forEach(({ status, timestamp }) => {
        statusList.push({ status, timestamp });
      });
      return statusList;
    }

    const ret = result.map((r) => ({
      ...r.toObject(),
      senderName: r.sender.username,
      receiverName: r.receiver.username,
    }));

    return ret;
  }
}
