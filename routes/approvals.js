import express from 'express';
import {
  getPendingProjectsForSupervisor,
  approveFYP,
  rejectFYP,
  getAvbSupervisors,
} from '../controllers/fyp.js';

const approvalsRouter = express.Router();

approvalsRouter.post('/approve', approveFYP);
approvalsRouter.post('/reject', rejectFYP);
approvalsRouter.post('/', getPendingProjectsForSupervisor);
approvalsRouter.get('/getAvbSupervisors', getAvbSupervisors);

export default approvalsRouter;
