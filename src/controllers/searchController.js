import JWT from '../utils/jwt.js';
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
      private: new SearchPrivateMessage(privateChatModel),
      announcement: new SearchAnnouncements(announcementModel),
    };
  }

  async search(req, res) {
    const {
      context, pageSize, pageNum, ...otherParams
    } = req.query;
    console.log(req.query);
    const searchStrategy = this.searchStrategies[context];
    const result = await searchStrategy.execute(otherParams, pageSize, pageNum);
    res.status(200).json(result);
  }
}

export default SearchController;
