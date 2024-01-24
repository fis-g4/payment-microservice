import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { Payment } from '../db/models/payment'
import { PricePlan } from '../db/models/plan'

dotenv.config()

const BASE_URL = '/v1/payments'

enum PlanType {
    FREE = 'FREE',
    PREMIUM = 'PREMIUM',
    PRO = 'PRO',
}

enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImZpcnN0TmFtZSI6IkpvaG4iLCJsYXN0TmFtZSI6IkRvZSIsInVzZXJuYW1lIjoiam9obmRvZTEyMyIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJwcm9maWxlUGljdHVyZSI6Imh0dHBzOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS9maXNnNC11c2VyLWltYWdlcy1idWNrZXQvZGVmYXVsdC11c2VyLmpwZyIsImNvaW5zQW1vdW50IjowLCJyb2xlIjoiVVNFUiIsInBsYW4iOiJQUk8ifSwiaWF0IjoxNzA2MDk1OTU1LCJleHAiOjE3MDYxODIzNTV9.uy7VYlJpQ66ZowMRjx0LpKPpn9G2EV8ezRsh3ktIdGY'

const TEST_URLS = {
    getSpecificPayment: `${BASE_URL}/:paymentId/user/:username`,
    createCoursePayment: `${BASE_URL}/course/:courseId/user/:username`,
    createMaterialPayment: `${BASE_URL}/material/:materialId/user/:username`,
    getHistory: `${BASE_URL}/history/user/:username`,
    getPlans: `${BASE_URL}/plans`,
}

const PAYMENT_DATA = {
    paymentId: '60b7d4c4b6e2c4b6c4f2a8f5',
    courseId: '60b7d4c4b6e2c4b6c4f2a8f5',
    materialId: '60b7d4c4b6e2c4b6c4f2a8f5',
    username: 'test',
}

let mongod: any

const app = require('../index')

const setupSamplePlans = async () => {
    const plans = [
        {
            name: 'Free',
            description: 'Free plan',
            price: 0,
            currency: 'USD',
            features: ['Free'],
        },
        {
            name: 'Premium',
            description: 'Premium plan',
            price: 10,
            currency: 'USD',
            features: ['Premium'],
        },
        {
            name: 'Pro',
            description: 'Pro plan',
            price: 20,
            currency: 'USD',
            features: ['Pro'],
        },
    ]

    await PricePlan.insertMany(plans)
}

jest.mock('../service/user', () => {
    return {
        UserService: jest.fn().mockImplementation(() => {
            return {
                login: jest.fn(),
                getUserByUsername: jest.fn().mockResolvedValue({
                    data: {
                        _id: 'user_id',
                        username: 'test',
                        email: 'user@example.com',
                    },
                }),
            }
        }),
    }
})

jest.mock('../service/courses', () => {
    return {
        getCourseById: jest.fn().mockReturnValue({
            id: 'material_id',
            name: 'Material Name',
            price: 4.99,
            currency: 'USD',
        }),
    }
})

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }

    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)

    await setupSamplePlans()
})

afterAll(async () => {
    const server = app.server
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((err: any) => {
                if (err) {
                    return reject(err)
                }
                resolve(true)
            })
        })
        console.log('Http server closed.')
    }
    await mongoose.disconnect()
})

describe('Payment', () => {
    it('should return 200 OK status', async () => {
        const res = await request(app).get(`${BASE_URL}/health`)
        expect(res.status).toEqual(200)
    })

    it('should return 200 OK status for get specific payment', async () => {
        const res = await request(app)
            .get(
                `${TEST_URLS.getSpecificPayment
                    .replace(':paymentId', PAYMENT_DATA.paymentId)
                    .replace(':username', PAYMENT_DATA.username)}`
            )
            .set('Authorization', `Bearer ${TOKEN}`)
        expect(res.status).toEqual(200)
    })

    it('should create a payment record and return session URL', async () => {
        const response = await request(app)
            .post('/courses/course_id/users/testuser')
            .expect(200)

        // Verificar que se haya creado el registro de pago
        expect(Payment.build).toHaveBeenCalledWith({
            amount: 9.99,
            currency: 'EUR',
            referenceId: 'course_id',
            referenceType: 'course',
            status: 'pending',
            userId: 'user_id',
            userName: 'testuser',
            externalPaymentId: 'session_id',
        })
    })

    it('should create a payment record and return session URL', async () => {
        const response = await request(app)
            .post('/materials/material_id/users/testuser')
            .expect(200)

        // Verificar que se haya creado el registro de pago
        expect(Payment.build).toHaveBeenCalledWith({
            amount: 4.99,
            currency: 'USD',
            referenceId: 'material_id',
            referenceType: 'material',
            status: 'pending',
            userId: 'user_id',
            userName: 'testuser',
            externalPaymentId: 'session_id',
        })

        // Verificar que la respuesta contenga el registro de pago, el ID del material y el usuario
        expect(response.body.materialId).toBe('material_id')
        expect(response.body.user).toBeDefined()
    })
})
