import mongoose from "mongoose";

const ShelterFactory = (connection) => {
    const ShelterSchema = new mongoose.Schema({
        shelterName: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
            required: true,
        },
        latitude: {
            type: String,
            required: true,
        },
    
        // add more fields
    });

    let ShelterModel;
    if (connection.models.Shelter) {
        ShelterModel = connection.models.Shelter;
    } else {
        ShelterModel = connection.model('Shelter', ShelterSchema);
    }

    class Shelter extends ShelterModel {
        static async get(filter, projection, options) {
            return this.find(filter, projection, options)
            .then((shelters) => shelters.map((shelter) => new Shelter(shelter)));
        }
    }
    return Shelter;
}

export default ShelterFactory;

