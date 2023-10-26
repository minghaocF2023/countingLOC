// import mongoose from 'mongoose';
import mongoose from 'mongoose';
import 'dotenv/config';

// Real database connection
const realUri = process.env.REALURI;
const realConnection = mongoose.createConnection(realUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test database connection

const testUri = process.env.TESTURI;
const testConnection = mongoose.createConnection(testUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { realConnection, testConnection };
