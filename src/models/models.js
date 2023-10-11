import mongoose from '../services/db.js';

import userFactory from './userModel.js';
import publicMessageFactory from './publicMessageModel.js';

const User = userFactory(mongoose);
const PublicMessage = publicMessageFactory(mongoose);

export { User, PublicMessage };
