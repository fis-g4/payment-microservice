import { Request, Response } from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../..'
import { Payment } from '../../db/models/payment'

describe('Payment Controller', () => {
    let req: Request
    let res: Response
    let mongoServer: MongoMemoryServer
    let mongoUri = null

    const connectDB = async () => {
        try {
            mongoServer = await MongoMemoryServer.create()
            mongoUri = mongoServer.getUri()
            console.log(`MongoDB successfully connected to ${mongoUri}`)
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }

    const closeDB = async () => {
        try {
            await mongoServer.stop()
            console.log('MongoDB successfully disconnected')
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }

    beforeAll(async () => {
        connectDB()
    })

    afterAll(async () => {
        closeDB()
    })

    beforeEach(() => {
        req = {} as Request
        res = {} as Response
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
    })

    describe('POST /plans/:planId/users/:userId', () => {
        it.only('should handle the payment for a plan', async () => {
            const planId = '1'
            const userId = '1'

            req.params = { planId, userId }

            // Mock user and plan
            const user = {
                id: userId,
                name: 'John Doe',
                email: 'john@gmail.com',
            }

            const plan = {
                id: planId,
                name: 'Basic',
                price: 10,
                currency: 'usd',
            }

            // Mock database calls
            const spyUserFindOne = jest.spyOn(Payment, 'findOne')
            spyUserFindOne.mockReturnValueOnce(user as any)

            const result = await request(app).post(
                `/payments/plans/${planId}/users/${userId}`
            )

            console.log('RESULT: ', result)

            expect(result.status).toBe(200)
        })
    })

    describe('POST /courses/:courseId/users/:userId', () => {
        it('should handle the payment for a course', async () => {
            // Implementa tus pruebas para esta ruta específica aquí
        })
    })

    describe('POST /materials/:materialId/users/:userId', () => {
        it('should handle the payment for a material', async () => {
            // Implementa tus pruebas para esta ruta específica aquí
        })
    })

    describe('GET /history/users/:userId', () => {
        it('should retrieve payment history for a user', async () => {
            // Implementa tus pruebas para esta ruta específica aquí
        })
    })

    describe('GET /:paymentId/user/:userId', () => {
        it('should retrieve a specific payment for a user', async () => {
            // Implementa tus pruebas para esta ruta específica aquí
        })
    })
})
