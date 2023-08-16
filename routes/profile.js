import express from 'express';
import { updateSupervisor, updateStudent } from '../controllers/profile.js';
const profileRouter = express.Router();

profileRouter.put('/update', updateSupervisor);
profileRouter.put('/updateStudent', updateStudent);

export default profileRouter;
