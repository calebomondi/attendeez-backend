import express from 'express';
import { classStatus, timetable } from '../controllers/classController.js';

const classRouter = express.Router();

classRouter.route('/class-status').get(classStatus);

classRouter.route('/timetable').get(timetable);

export default classRouter;