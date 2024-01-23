import dotenv from 'dotenv'
import request from 'supertest'

dotenv.config()

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8000/v1/payments'

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

const USER_TO_GENERATE_TOKEN = {
    username: 'johndoe',
    password: 'johndoepassword',
}

describe('Payment', () => {
    let token = ''

    beforeAll(async () => {
        const res = await request(`${process.env.USER_SERVICE_BASE_URL}/new`)
            .post('/login')
            .send(USER_TO_GENERATE_TOKEN)
        token = res.body.token
    })

    describe('GET /payments/:paymentId/user/:username', () => {
        it('should return 200 OK', async () => {
            const res = await request(
                TEST_URLS.getSpecificPayment
                    .replace(':paymentId', PAYMENT_DATA.paymentId)
                    .replace(':username', PAYMENT_DATA.username)
            ).get('')
            expect(res.status).toBe(200)
        })
    })

    describe('POST /payments/course/:courseId/user/:username', () => {
        it('should return 201 CREATED', async () => {
            const res = await request(
                TEST_URLS.createCoursePayment
                    .replace(':courseId', PAYMENT_DATA.courseId)
                    .replace(':username', PAYMENT_DATA.username)
            ).post('')
            expect(res.status).toBe(201)
        })
    })

    describe('POST /payments/material/:materialId/user/:username', () => {
        it('should return 201 CREATED', async () => {
            const res = await request(
                TEST_URLS.createMaterialPayment
                    .replace(':materialId', PAYMENT_DATA.materialId)
                    .replace(':username', PAYMENT_DATA.username)
            ).post('')
            expect(res.status).toBe(201)
        })
    })

    describe('GET /payments/history/user/:username', () => {
        it('should return 200 OK', async () => {
            const res = await request(
                TEST_URLS.getHistory.replace(':username', PAYMENT_DATA.username)
            ).get('')
            expect(res.status).toBe(200)
        })
    })

    describe('GET /payments/plans', () => {
        it('should return 200 OK', async () => {
            const res = await request(TEST_URLS.getPlans).get('')
            expect(res.status).toBe(200)
        })
    })
})
