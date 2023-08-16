import express from 'express';
import { addMeeting } from '../controllers/fyp.js';

const meetingRouter = express.Router();

meetingRouter.post('/', addMeeting);

export default meetingRouter;
