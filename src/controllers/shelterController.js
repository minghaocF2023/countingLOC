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
        // console.log('------shelters: ' + shelters)
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
            shelterName: req.body.shelterName,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
        };
        console.log('----data----:' + 
        `shelter name: ${data.shelterName}, latitude: ${data.latitude}, longitude: ${data.longitude}`);
        const newShelter = new this.shelterModel(data);
        await newShelter.save();
        res.status(201).json({ success: true, data: newShelter });
    }

    /**
    * update an existing shelter
    */
    async updateShelter(req, res) {
        const payload = authChecker.checkAuth(req, res);
        if (payload === null) {
            return;
        }
        if (testChecker.isTest(res, payload)) {
            return;
        }

        const shelterId = req.params.shelterId;
        const updateData = req.body;

        try {
            const updatedShelter = await this.shelterModel.findByIdAndUpdate(
                shelterId,
                updateData,
                { new: true }
            );

            if (!updatedShelter) {
                return res.status(404).json({ success: false, message: 'Shelter not found' });
            }

            res.status(200).json({ success: true, data: updatedShelter });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
    * delete an existing shelter
    */
    async deleteShelter(req, res) {
        const payload = authChecker.checkAuth(req, res);
        if (payload === null) {
            return;
        }
        if (testChecker.isTest(res, payload)) {
            return;
        }

        const shelterId = req.params.shelterId;

        try {
            const shelter = await this.shelterModel.findByIdAndDelete(shelterId);
            if (!shelter) {
                return res.status(404).json({ success: false, message: 'Shelter not found' });
            }
            res.status(200).json({ success: true, message: 'Shelter deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getShelterById(req, res) {
        const shelterId = req.params.shelterId;
        try {
            const shelter = await this.shelterModel.findById(shelterId);
            if (!shelter) {
                return res.status(404).json({ success: false, message: 'Shelter not found' });
            }
            res.status(200).json({ success: true, data: shelter });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default ShelterController;