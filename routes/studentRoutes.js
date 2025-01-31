import express from 'express';
import { attendedToday, studentInfo, joinSession, inAttendance, uploadMultiple, uploadSingle, progress } from '../controllers/studentController.js';

const studentRouter = express.Router();

//
studentRouter.route('/attended-today').get(attendedToday);

studentRouter.route('/student-info').get(studentInfo);
  
studentRouter.route('/join-session').post(joinSession);
  
studentRouter.route('/in-attendance').get(inAttendance);

studentRouter.route('/upload-multiple').post(uploadMultiple);
  
studentRouter.route('/upload-single').post(uploadSingle)

studentRouter.route('/progress').get(progress);

export default studentRouter;