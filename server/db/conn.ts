import mongoose from 'mongoose'

const dbUri = process.env.DB_URI as string
try {
    console.log('Connecting to MongoDB: ' + dbUri)
    mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true')
} catch (err) {
    console.log('Error connecting to MongoDB')

    console.log(err)
}
