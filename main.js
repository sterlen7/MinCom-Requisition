const express = require('express');
const app = express();
require('dotenv').config()
const mongoose =require('mongoose');
const fs = require("fs")
const path = require("path")
const db_connection = require ('./config/db')
const { userRouter } = require('./Routes/userRouter');
const { adminRouter } = require('./Routes/adminRouter');

db_connection()

// app.use('/api', userRouter)
// app.use('/api', adminRouter)

const PORT = process.env.PORT

app.get('/', (req, res, next) => {
    res.send('<h1>Hello world<h1>');
})

try {	
	fs.readdirSync(path.join(__dirname, "routes")).map((file) => {
		const userRouter = require(`./Routes/userRouter`)
		app.use("/api",userRouter)
	})
} catch (error) {
	console.error("Error loading routes:", error);
}

app.listen(PORT, () => {
    console.info(`Server listen on port ${PORT}`);
})