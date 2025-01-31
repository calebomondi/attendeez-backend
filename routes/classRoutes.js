import express from 'express';
import { classStatus, timetable, endBeforeTime, checkSessionEnd, sessionStarted, activeSession } from '../controllers/classController.js';

const classRouter = express.Router();

//routes
classRouter.route('/class-status').get(classStatus);

classRouter.route('/timetable').get(timetable);

classRouter.route('/end-before-time').get(endBeforeTime);
  
classRouter.route('/check-session-end').get(checkSessionEnd);
  
classRouter.route('/session-started').get(sessionStarted);

classRouter.route('/active-session').get(activeSession);

export default classRouter;