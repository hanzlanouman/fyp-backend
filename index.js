import express from 'express';
import loginRouter from './routes/login.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import fypRouter from './routes/fyp.js';
import profileRouter from './routes/profile.js';
import inboxRouter from './routes/inbox.js';
import meetingRouter from './routes/meeting.js';
import approvalsRouter from './routes/approvals.js';
const app = express();

// use cors and body-parser

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/login', loginRouter);
app.use('/unregstudent', fypRouter);
app.use('/supervisor', profileRouter);
app.use('/student', profileRouter);
app.use('/regStudent', fypRouter);
app.use('/loadInbox', inboxRouter);
app.use('/addMeeting', meetingRouter);
app.use('/', inboxRouter);
app.use('/loadApprovals', approvalsRouter);
app.use('/FYP', approvalsRouter);
app.listen(5000, () => console.log('Server Running'));
