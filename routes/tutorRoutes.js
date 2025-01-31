import express from 'express';
import { attendanceStats, attendanceSummary, confirmedToday, finishClassSession, getTeacherInfo, myclassesToday, startClassSession } from '../controllers/tutorController.js';

const tutorRouter = express.Router();

// routes
tutorRouter.route('/finish-classsession').put(finishClassSession);

tutorRouter.route('/myclasses-today').get(myclassesToday);
  
tutorRouter.route('/attendance-stats').get(attendanceStats)
  
tutorRouter.route('/attendance-summary').get(attendanceSummary)

tutorRouter.route('/teacher-info').get(getTeacherInfo);
  
tutorRouter.route('/confirmed-today').get(confirmedToday)
  
tutorRouter.route('/start-classsession').post(startClassSession)

export default tutorRouter;