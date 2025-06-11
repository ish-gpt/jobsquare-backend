const express = require('express');
const http = require('http');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const recruiterRoutes = require('./routes/recruitersRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const { connectToDb } = require('./dbConnection/dbConnection');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connectToDb();

const server = http.createServer(app);
app.get('/', (req, res, next) => {
    res.json("Hello from server");
})

app.use('/recruiters', recruiterRoutes.routes);
app.use('/applicants', applicantRoutes.routes);

server.listen(process.env.PORT, () => {
    console.log("Server is listening on port - ", process.env.PORT);
})