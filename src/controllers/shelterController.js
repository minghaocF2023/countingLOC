import authChecker from "../utils/authChecker.js";
import testChecker from "../utils/testChecker.js";

class ShelterController {
    constructor(userModel, shelterModel){
        this.userModel = userModel;
        this.shelterModel = shelterModel;
    }

    /**
    * Get all existing shelters 
    */
    async getAllShelters(req, res) {
        const payload = authChecker.checkAuth(req, res);
        if (payload === null) {
            return;
        }
        if (testChecker.isTest(res, payload)) {
            return;
        }
        
        const shelters = await this.shelterModel.find({});
        res.status(200).json({ success: true, data: shelters });
    }

    /**
    * create new shelter
    */
    async createNewShelter(req, res) {
        const payload = authChecker.checkAuth(req, res);
        if (payload === null) {
            return;
        }
        if (testChecker.isTest(res, payload)) {
            return;
        }
        // create new shelter
        
        const data = {
            shelterName: req.body.shelterName.toLowerCase(),
            longitude: req.body.longitude,
            latitude: req.body.latitude,
        };
        console.log('----data----:' + 
        `shelter name: ${data.shelterName}, latitude: ${data.latitude}, longitude: ${data.longitude}`);
        const newShelter = new this.shelterModel(data);
        res.status(201).json({ success: true, data: newShelter });
    }
}

export default ShelterController;