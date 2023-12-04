import {
  SearchCitizens, SearchPublicMessage, SearchPrivateMessage, SearchAnnouncements,
} from '../models/searchStrategy.js';

class SearchController {
  constructor(userModel, publicChatModel, privateChatModel, chatroomModel, announcementModel) {
    this.userModel = userModel;
    this.publicChatModel = publicChatModel;
    this.privateChatModel = privateChatModel;
    this.chatroomModel = chatroomModel;
    this.announcementModel = announcementModel;

    /** @type {[import('../models/searchStrategy.js').SearchStrategy]} */
    this.searchStrategies = {
      user: new SearchCitizens(userModel),
      public: new SearchPublicMessage(publicChatModel),
      private: new SearchPrivateMessage(privateChatModel, userModel),
      announcement: new SearchAnnouncements(announcementModel),
    };
  }

  async search(req, res) {
    const {
      context, pageSize, pageNum, ...otherParams
    } = req.query;
    // console.log(req.query);
    const searchStrategy = this.searchStrategies[context];
    if (!searchStrategy) {
      res.status(404).json({ message: 'Invalid search context', context });
      console.error(`Invalid search context: ${context}`);
      return;
    }
    const result = await searchStrategy.execute(otherParams, pageSize, pageNum);
    res.status(200).json(result);
  }
}

export default SearchController;
