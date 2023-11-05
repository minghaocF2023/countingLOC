import JWT from "../utils/jwt";

class SearchController {
    constructor() {
        this.searchStrategies = {
            'citizenByUsername': new SearchCitizensByUsername(),
            'citizenByStatus': new SearchCitizensByStatus(),
            'announcementByWords': new SearchAnnouncementsByWords(),
            'publicMessageByWords': new SearchPublicMessageByWords(),
            'privateMessageByWords': new SearchPrivateMessageByWords(),
        }
    }
}

export default SearchController;