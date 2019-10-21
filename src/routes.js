import { Router } from 'express'; // const { Router } = require('express');

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
// (routa para testes )routes.get('/', (req, res) => res.json({ messagem: 'Olá Xarlys' }));
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

export default routes;
