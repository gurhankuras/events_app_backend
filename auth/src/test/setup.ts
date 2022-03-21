import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { logger } from '@gkeventsapp/common'

let mongo: MongoMemoryServer
jest.useFakeTimers('legacy')

// Test-wide mock
jest.mock('../nats-wrapper')

beforeAll(async () => {
    logger.level = 'info'
    process.env.JWT_KEY = 'dummy'
    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri)
});

beforeEach(async () => {
    jest.clearAllMocks()
    await truncateDatabase()
})

afterAll(async () => {
    await closeConnections();
})

async function truncateDatabase() {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
}

async function closeConnections() {
    await mongo.stop()
    await mongoose.connection.close()
}