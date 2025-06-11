const express = require('express');
const router = express.Router();
const { loginApplicant, signupApplicant, applyForaJob, getAllJobs } = require('../controllers/applicantsController');
const { authenticate } = require('../middlewares/authenticateApplicant');

router.post('/signup', signupApplicant);
router.post('/login', loginApplicant);
router.post('/applyjob/:id', authenticate, applyForaJob);
router.get('/jobs', authenticate, getAllJobs);
// router.post('/logout', authenticate, logout);


module.exports = {
    routes: router
}