/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-console */
import express from 'express';
import path, { dirname } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import indexRouter from './src/routes/indexRouter.js';
import userRouter from './src/routes/userRouter.js';
import messageRouter from './src/routes/messageRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on port 3000');
});
