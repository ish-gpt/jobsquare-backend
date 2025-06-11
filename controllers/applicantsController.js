const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getInstance } = require('../dbConnection/dbConnection');
const { ObjectId } = require('mongodb');

require('dotenv').config();

const logout = (req, res) => {
    res.clearCookie('token');

    res.status(200).json({ message: 'Logged out successfully' });
}

const signupApplicant = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: 'Email/password required'
            })
        }
        // console.log(email, password);
        const dbInstance = getInstance();

        let hashedPass = await hashPassword(password);
        const applicantsCollection = dbInstance.collection('applicant');

        const user = await applicantsCollection.insertOne({
            password: hashedPass,
            email: email
        })

        if (user.insertedCount) {
            const jobsApplicantCollection = dbInstance.collection('appliedJobs');
            await jobsApplicantCollection.insertOne({ userId: user.insertedId, jobIds: [] });
        }


        console.log("Signing up the user...");
        res.status(200).json({
            message: 'Signup Successful'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Some error has occured - ',
            error: error
        })
    }

}

const loginApplicant = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: 'Email/password required'
            })
        }
        // console.log(email, password);
        const dbInstance = getInstance();

        const applicantsCollection = dbInstance.collection('applicant');
        let user = await applicantsCollection.findOne({ email: email });
        if (!user) {
            res.status(400).json("User not found");
        }
        let applicantDataForToken = {
            name: user.name,
            email: user.email
        }
        jwt.sign(applicantDataForToken, process.env.SecretKeyApplicant, { expiresIn: 60 * 60 }, function (err, token) {
            if (err) {
                res.status(400).json({
                    message: 'Error in creating Token'
                });
            }
            res.status(200).json({
                message: 'Token created successfully',
                "token": token
            });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Some error has occured - ',
            error: error
        })
    }

}


const applyForaJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const uId = req.query.uid;
        if (!jobId) {
            res.status(400).json({
                message: 'JobId required'
            })
        }
        const dbInstance = getInstance();

        const jobsCollection = dbInstance.collection('jobs');

        const job = await jobsCollection.findOne({
            _id: ObjectId(jobId)
        })
        if (!job) {
            res.status(400).json({
                message: 'Job with this Id is not present / Invalid jobId'
            })
        }

        const applicantCollection = dbInstance.collection('applicant');


        const applier = await applicantCollection.findOne({
            _id: ObjectId(uId)
        });

        const objToPush = {
            email: applier.email,
            ApplierId: applier._id
        }

        const jobApplicantCollection = dbInstance.collection('jobApplicant');

        const insertedApplicantInJob = await jobApplicantCollection.updateOne(
            { jobId: ObjectId(jobId) },
            { $push: { applicants: objToPush } }
        );

        if (insertedApplicantInJob.modifiedCount === 0) {
            throw new Error('No document was updated - job may not exist');
        }

        const appliedJobsCollection = dbInstance.collection('appliedJobs');

        const result = appliedJobsCollection.updateOne(
            { userId: ObjectId(uId) },
            { $push: { jobIds: job } }
        );

        
        res.status(200).json({
            message: 'Applpied To Job Successfull'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Some error has occured - ',
            error: error
        })
    }
}

const getAllJobs = async (req, res, next) => {
    const dbInstance = getInstance();

    const jobsCollection = dbInstance.collection('jobs');

    const jobs = await jobsCollection.find({
    }).toArray();
    console.log(jobs)

    if (!jobs.length) {
        return res.status(200).json({
            message: 'No open jobs Yet'
        });
    }

    res.status(200).json({
        message: jobs
    })
    
}

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                reject('Error generating Salt');
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    reject('Error generating hash');
                }
                resolve(hash);
            });
        });
    })
}

module.exports = {
    signupApplicant, loginApplicant, logout, applyForaJob, getAllJobs
}