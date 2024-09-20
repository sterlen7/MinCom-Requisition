const mongoose = require("mongoose")
const colors = require("colors")
const { systemLogs } = require("../middlewares/logger")
const db_connection = async () => {
	// connect to mongodb

	try {
		await mongoose.connect(process.env.MONGODB_URL)

		console.log(
			"Connection to MongoDB is established".blue,
			mongoose.connection.host
		)

		systemLogs.info(
			"Connection to MongoDB is established",
			mongoose.connection.host
		)
	} catch (error) {
		console.log("Connection to MongoDB failed")
		console.log({ error })
	}
}

module.exports = db_connection
