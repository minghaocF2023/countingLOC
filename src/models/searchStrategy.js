// SearchStrategy interface
class SearchStrategy {
  // query methods, table to access, number of entries to display (display methods - can be front end)
  execute(criteria, context) {
    throw new Error('SearchStrategy.execute() must be implemented');
  }
}

// Concrete strategy for searching citizens by username
class SearchCitizens extends SearchStrategy {
  constructor(userModel) {
    super();
    this.userModel = userModel;
  }
  
  /**
   * @param {Object} query
   */
  async execute(queryParams) {
    // {status: 'help', username: 'joe'}
  // process query so that understandable by mongoose
    const { username, status } = queryParams;
    let query = {};
    if (username) {
        query.username = { $regex: username, $options: 'i'};
    }
    if (status){
        query.status = status;
    }

    // let users = await this.userModel.find(query).sort({ isOnline: -1, username: 1 });
    return await this.userModel.find(query);
  }
}

class SearchAnnouncementsByWords extends SearchStrategy {
    constructor(announcementModel) {
        super();
        this.announcementModel = announcementModel;
    }
    async execute(queryParams) {
      // Logic to search announcements by key word(s)
      const { keywords } = queryParams;
      const searchQuery = { $text: { $search: keywords }};

      let announcementRes = await this.announcementModel.find(searchQuery).limit(10);
      return announcementRes;
    }
}

class SearchPublicMessageByWords extends SearchStrategy {
    constructor(publicMessageModel) {
        super();
        this.publicMessageModel = publicMessageModel;
    }
    async execute(queryParams) {
      // Logic to search public messages by key word(s)
      const { keywords } = queryParams;
      const searchQuery = { $text: { $search: keywords } };

      let publicMsgRes = await this.publicMessageModel.find(searchQuery);
      return publicMsgRes;
    }
}

class SearchPrivateMessageByWords extends SearchStrategy {
    constructor(privateMessageModel) {
        super();
        this.privateMessageModel = privateMessageModel;
    }
    async execute(queryParams) {
      // Logic to search private messages by key word(s)
      const { keywords } = queryParams;
      const searchQuery = { $text: { $search: keywords } };

      let privateMsgRes = await this.privateMessageModel.find(searchQuery);
      return publicMsgRes;
      return 'Results for private messages by key word(s)';
    }
}
// Add additional concrete strategies for other search contexts...
  