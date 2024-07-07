const express = require('express');
const app = express();
require('dotenv').config()
const mongoose =require('mongoose')

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('Database connected'))
.catch((err)=>{console.log(err)})

const PORT = process.env.PORT

app.get('/', (req, res, next) => {
    res.send('<h1>Hello world<h1>');
})

app.listen(PORT, () => {
    console.info(`Server listen on port ${PORT}`);
})