/* eslint-disable max-classes-per-file */
// SearchStrategy interface
class SearchStrategy {
  execute(criteria, context) {
    throw new Error('SearchStrategy.execute() must be implemented');
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
  async execute(queryParams, pageSize = 10, pageNum = 0) {
    const { username, status } = queryParams;
    const query = { username: new RegExp(username, 'i'), status: new RegExp(status, 'i') };
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

  async execute(queryParams) {
    // Logic to search announcements by key word(s)
    const { keywords } = queryParams;
    const searchQuery = { $text: { $search: keywords } };

    const announcementRes = await this.announcementModel.find(searchQuery).limit(10);
    return announcementRes;
  }
}

export class SearchPublicMessage extends SearchStrategy {
  constructor(publicMessageModel) {
    super();
    this.publicMessageModel = publicMessageModel;
  }

  async execute(queryParams) {
    // Logic to search public messages by key word(s)
    const { keywords } = queryParams;
    const searchQuery = { $text: { $search: keywords } };

    const publicMsgRes = await this.publicMessageModel.find(searchQuery);
    return publicMsgRes;
  }
}

export class SearchPrivateMessage extends SearchStrategy {
  constructor(privateMessageModel) {
    super();
    this.privateMessageModel = privateMessageModel;
  }

  async execute(queryParams) {
    // Logic to search private messages by key word(s)
    const { keywords } = queryParams;
    const searchQuery = { $text: { $search: keywords } };

    const privateMsgRes = await this.privateMessageModel.find(searchQuery);
    return publicMsgRes;
    return 'Results for private messages by key word(s)';
  }
}
// Add additional concrete strategies for other search contexts...
