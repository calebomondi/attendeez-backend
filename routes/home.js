import express from 'express';

const homeRouter = express.Router();

homeRouter.route('/').get((req, res) => {
    res.send('Welcome to Attendeez Backend');
});

export default homeRouter;