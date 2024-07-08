const express = require('express');
const app = express();
require('dotenv').config()
const mongoose =require('mongoose');
const { userRouter } = require('./Routes/userRouter');

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('Database connected'))
.catch((err)=>{console.log(err)})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', userRouter)

const PORT = process.env.PORT

app.get('/', (req, res, next) => {
    res.send('<h1>Hello world<h1>');
})

app.listen(PORT, () => {
    console.info(`Server listen on port ${PORT}`);
})