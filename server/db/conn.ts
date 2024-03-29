import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function connectToMongoDB() {
    try {
        const dbUri = process.env.DATABASE_URI as string
        console.log('Connecting to MongoDB: ' + dbUri)
        await mongoose.connect(dbUri, {
            dbName: 'fis',
        })
    } catch (err) {
        console.log('Error connecting to MongoDB')
        console.log(err)
    }
}

connectToMongoDB()
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((err) => {
        console.log(err)
    })
