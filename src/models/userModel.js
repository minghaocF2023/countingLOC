import mongoose from '../services/db.js';
// user class
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  // TODO: status, isAdmin: false
});

const User = mongoose.model('User', UserSchema);

export default User;
