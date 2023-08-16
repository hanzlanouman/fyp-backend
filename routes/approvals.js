import express from 'express';
import {
  getPendingProjectsForSupervisor,
  approveFYP,
  rejectFYP,
} from '../controllers/fyp.js';

const approvalsRouter = express.Router();

approvalsRouter.post('/approve', approveFYP);
approvalsRouter.post('/reject', rejectFYP);
approvalsRouter.post('/', getPendingProjectsForSupervisor);

export default approvalsRouter;
