import express from 'express';
import { loadInbox, loadSupervisorInbox } from '../controllers/inbox.js';
const inboxRouter = express.Router();

inboxRouter.post('/', loadInbox);
inboxRouter.post('/loadSupervisorInbox', loadSupervisorInbox);

export default inboxRouter;
