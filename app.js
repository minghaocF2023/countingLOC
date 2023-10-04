/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-console */
import express from 'express';
import path, { dirname } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import indexRouter from './src/routes/indexRouter.js';
import userRouter from './src/routes/userRouter.js';
import messageRouter from './src/routes/messageRouter.js';
import SocketServer from './src/services/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/node_modules', express.static(`${__dirname}/node_modules/`));
app.use(express.static('src/public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

const options = {
  definition: {

    openapi: '3.1.0',
    info: {
      title: 'ESN Backend API',
      version: '1.1.0',
      description:
        'This is a CRUD API application for FSE Emergency Social Network.',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          value: 'Bearer <JWT token here>',
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://172.29.92.57:3000',
        description: 'Leo server',
      },
    ],
  },

  apis: ['./src/routes/*.js'],
};

app.use('/', indexRouter);
app.use('/users/', userRouter);
app.use('/messages/', messageRouter);

const specs = swaggerJSDoc(options);
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
);

const server = createServer(app);
const io = new Server(server);

const socketServer = new SocketServer(io);

// io.on('connection', (socket) => {
//   console.log(`a user connected ${socket.id}`);
//   socket.on('username', (msg) => {
//     console.log(msg);
//   });
// });
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

export default socketServer;
