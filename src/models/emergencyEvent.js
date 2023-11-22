import axios from 'axios';
import mongoose from 'mongoose';

const EmergencyEventFactory = (connection) => {
  if (connection.models.EmergencyEvent) {
    return connection.models.EmergencyEvent;
  }
  const EmergencyEventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    location: {
      type: String,
      required: true,
      default: 'Unknown',
    },
    coordinates: {
      type: [Number],
      required: false,
    },
    severity: {
      type: Number,
      required: true,
    },
    range_affected: {
      type: String,
      required: true,
    },
  });

  const EmergencyEventModel = connection.model('EmergencyEvent', EmergencyEventSchema);

  class EmergencyEvent extends EmergencyEventModel {
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((emergencyEvents) => emergencyEvents.map((ee) => new EmergencyEvent(ee)));
    }

    static async create(data) {
      const coordinates = data.coordinates
        || (await EmergencyEvent.getLocationInfo(data.location))?.coordinates;
      const event = new EmergencyEventModel({
        ...data,
        coordinates,
      });
      return event.save().then((ee) => new EmergencyEvent(ee));
    }

    static async getLocationInfo(query) {
      const url = 'https://api.opencagedata.com/geocode/v1/json';
      const params = {
        q: query,
        key: '03c48dae07364cabb7f121d8c1519492',
        no_annotations: 1,
        language: 'en',
      };
      const headers = {
        'User-Agent': 'Mozilla/5.0',
      };
      try {
        const { formatted, geometry } = await axios.get(url, { params, headers })
          .then((res) => res.data.results[0]);
        const { lat, lng } = geometry;
        return { location: formatted, coordinates: [lat, lng] };
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async update(update) {
      await this.updateOne(update);
    }

    async delete() {
      await this.deleteOne();
    }

    getTitle() {
      return this.title;
    }

    getDescription() {
      return this.description;
    }

    getTimestamp() {
      return this.timestamp;
    }

    getLocation() {
      return this.location;
    }

    getCoordinates() {
      return this.coordinates;
    }

    getSeverity() {
      return this.severity;
    }

    getRangeAffected() {
      return this.range_affected;
    }
  }

  return EmergencyEvent;
};

export default EmergencyEventFactory;
