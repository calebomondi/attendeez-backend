import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';

import studentRouter from './routes/studentRoutes.js';
import classRouter from './routes/classRoutes.js';
import tutorRouter from './routes/tutorRoutes.js';
import homeRouter from './routes/home.js';
import adminRouter from './routes/adminRouter.js';

config();

const app = express();
const port = process.env.PORT;

//middleware
app.use(cors({
    origin: ['http://localhost:5173','https://attendeez-tutor.vercel.app','https://attendeez.vercel.app']
}))
app.use(express.json())

//routes
app.use('/api/student', studentRouter);
app.use('/api/class', classRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/admin',adminRouter);
app.use('/', homeRouter);

//port
app.listen(port, () => {
    console.log(`Server Running On Port ${port}`);
})