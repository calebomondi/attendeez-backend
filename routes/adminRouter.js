import express from 'express';
import { uploadTeachers, uploadStudents, enroll } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.route('/upload/teachers').post(uploadTeachers);
adminRouter.route('/upload/students').post(uploadStudents);
adminRouter.route('/upload/enrollment').post(enroll);

export default adminRouter;