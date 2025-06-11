const express = require('express');
const router = express.Router();
const { postJobOnPortal, signupRecruiter, loginRecruiter, applicantsForJob, logout } = require('../controllers/recruitersController');
const { authenticate } = require('../middlewares/authenticate');

router.post('/signup', signupRecruiter);
router.post('/login', loginRecruiter);
router.post('/jobs', authenticate,postJobOnPortal);
router.get('/jobapplicants/:id', authenticate,applicantsForJob);
router.post('/logout', authenticate, logout );


module.exports = {
    routes: router
}