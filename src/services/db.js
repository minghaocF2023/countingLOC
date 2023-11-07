// import mongoose from 'mongoose';
import mongoose from 'mongoose';
import 'dotenv/config';

// Real database connection
const realUri = process.env.REALURI;
const realConnection = mongoose.createConnection(realUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100,
});

// Test database connection

const testUri = process.env.TESTURI;
const testConnection = mongoose.createConnection(testUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100,
});

export { realConnection, testConnection };
