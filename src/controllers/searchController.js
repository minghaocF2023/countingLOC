import JWT from "../utils/jwt.js";

class SearchController {
    constructor(userModel, publicChatModel, privateChatModel, chatroomModel, announcementModel) {
        this.userModel = userModel;
        this.publicChatModel = publicChatModel;
        this.privateChatModel = privateChatModel;
        this.chatroomModel = chatroomModel;
        this.announcementModel = announcementModel;
        
        this.searchStrategies = {
            // user: new UserSearchStrategy(userModel),
        }
    }

    async search(req, res) {
        const { context, ...otherParams } = req.query;
        res.status(200).json({ message: 'OK', context, ...otherParams });
        // const searchStrategy = this.searchStrategies[context];
        // const result = await searchStrategy.execute(otherParams);
        // res.status(200).json(result);
    }
}

export default SearchController;