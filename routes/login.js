import express from 'express';

import {
  supervisorLoginHandler,
  studentLoginHandler,
} from '../controllers/login.js';
const loginRouter = express.Router();

loginRouter.post('/supervisor', supervisorLoginHandler);
loginRouter.post('/student', studentLoginHandler);

export default loginRouter;
