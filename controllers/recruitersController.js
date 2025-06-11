const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getInstance } = require('../dbConnection/dbConnection');
const { ObjectId } = require('mongodb');

require('dotenv').config();

const postJobOnPortal = async (req, res, next) => {
    try {
        const { jobTitle, jobDescription } = req.body;
        if (!jobTitle || !jobDescription) {
            res.status(400).json({
                message: 'JobDescription/JobTitle required'
            })
        }
        const dbInstance = getInstance();

        const jobsCollection = dbInstance.collection('jobs');

        const insertedJob = await jobsCollection.insertOne({
            jobTitle: jobTitle,
            jobDescription: jobDescription
        })

        if (insertedJob.insertedCount) {
            const jobsApplicantCollection = dbInstance.collection('jobApplicant');
            await jobsApplicantCollection.insertOne({ jobId: insertedJob.insertedId, applicants: [] });
            // if (jobApplicants === null) {
            //     jobApplicants.applicants = [];
            // }
        }
        res.status(200).json({
            message: 'Job posted Successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Some error has occured - ',
            error: error
        })
    }
}


const applicantsForJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            res.status(400).json({
                message: 'Job ID is missing'
            })
        }
        const dbInstance = getInstance();
        console.log(jobId);

        const jobsApplicantCollection = dbInstance.collection('jobApplicant');

        const job = await jobsApplicantCollection.findOne({
            jobId: ObjectId(jobId)
        })

        if (!job) {
            res.status(400).json({
                message: 'Job you are looking for does not exists'
            });
            return;
        }
        if (!job.applicants.length) {
            res.status(200).json({
                message: 'No one has applied to this job yet'
            });
        } else {
            let applicants = job.applicants;
            res.status(200).json({
                message: 'Here are the applicant for this job',
                "applicants" : applicants
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Some error has occured - ',
            error: error
        })
    }
}

const logout = (req, res) => {
    res.clearCookie('token'); 

    res.status(200).json({ message: 'Logged out successfully' });
}

const signupRecruiter = async (req, res, next) => {

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
        const recruitCollection = dbInstance.collection('recruiters');

        await recruitCollection.insertOne({
            password: hashedPass,
            email: email
        })

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

const loginRecruiter = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: 'Email/password required'
            })
        }
        // console.log(email, password);
        const dbInstance = getInstance();

        const recruitCollection = dbInstance.collection('recruiters');
        let user = await recruitCollection.findOne({ email: email });
        if (!user) {
            res.status(400).json("User not found");
        }
        let recruiterDataForToken = {
            name: user.name,
            email: user.email
        }
        jwt.sign(recruiterDataForToken, process.env.SecretKey, { expiresIn: 60 * 60 }, function (err, token) {
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
    postJobOnPortal, signupRecruiter, loginRecruiter, applicantsForJob, logout
}