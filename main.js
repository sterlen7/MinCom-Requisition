const express = require('express');
const app = express();
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db_connection = require('./config/db');
const setTokenCleanUp = require('./utils/cleanToken')
const cors = require('cors')    

const corsOptions = {
    origin:['https://mincom-requisition.onrender.com', 'http://localhost:5000'],
    optionsSuccessStatus: 200
}


db_connection();

const PORT = process.env.PORT 


app.use(cors(corsOptions))
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

try {
    const routesPath = path.join(__dirname, 'Routes');
    
    fs.readdirSync(routesPath).forEach((file) => {
        const route = require(path.join(routesPath, file));
        if (typeof route === 'function') {
            app.use('/api', route);
        } else {
            console.error(`Error: ${file} does not export a valid Express router function`);
        }
    });
} catch (error) {
    console.error('Error loading routes:', error);
}

setTokenCleanUp()



app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`);
});
