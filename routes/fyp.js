import express from 'express';
import { fypRegister, addMilestone } from '../controllers/fyp.js';
const fypRouter = express.Router();

fypRouter.post('/', fypRegister);
fypRouter.post('/addMilestone', addMilestone);

export default fypRouter;
