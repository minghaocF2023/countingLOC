import mongoose from '../services/db.js';

import userFactory from './userModel.js';
import oublicMessageFactory from './publicMessageModel.js';

const User = userFactory(mongoose);
const PublicMessage = oublicMessageFactory(mongoose);

export { User, PublicMessage };
