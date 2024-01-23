import express, { Request, Response } from 'express'
import { Payment } from '../db/models/payment'
import { PricePlan } from '../db/models/plan'
import { getCourseById } from '../mocks/courses.mock'
import { CourseService } from '../service/courses'
import { UserService } from '../service/user'

const router = express.Router()

const stripeConnection = {
    secret_key: process.env.STRIPE_SECRET_KEY || 'sk_test',
    publishable_key: process.env.STRIPE_PUBLIC_KEY || 'pk_test',
}

const stripe = require('stripe')(stripeConnection.secret_key)

/**
 * @swagger
 * /payments/health:
 * get:
 *  summary: Health check for the payments API
 * tags:
 * - Payments
 * responses:
 *  200:
 *   description: Health check successful
 *  schema:
 *  type: object
 * properties:
 * status:
 * type: string
 * description: Status of the API
 * example: ok
 */

router.get('/check', async (req: Request, res: Response) => {
    return res.status(200).json({ status: 'ok' })
})

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payments management API
 */

/**
 * @swagger
 * /courses/{courseId}/users/{userId}:
 *   post:
 *     summary: Create a payment record for a user's course enrollment
 *     tags:
 *       - Courses
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the course
 *       - name: username
 *         in: path
 *         required: true
 *         type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Payment record created successfully
 *         schema:
 *           type: object
 *           properties:
 *             payment:
 *               $ref: '#/definitions/Payment'
 *       404:
 *         description: Course or user not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */
router.post(
    '/courses/:courseId/users/:username',
    async (req: Request, res: Response) => {
        const { courseId, username } = req.params

        // Step 1: Fetch the course from the database
        const courseService = new CourseService()
        const course = await courseService.login().then(() => {
            return courseService.getCourseById(courseId)
        })
        if (!course) {
            return res.status(404).json({ error: 'Course not found' })
        }
        // Step 2: Fetch the user from the database
        const userService = new UserService()
        const user = await userService
            .login()
            .then(() => userService.getUserByUsername(username))
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.data.email,
            line_items: [
                {
                    price_data: {
                        product_data: {
                            name: course.name,
                        },
                        unit_amount: course.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
        })

        // Step 3: Create a payment record
        const payment = Payment.build({
            amount: course.price,
            currency: 'EUR',
            referenceId: course.id,
            referenceType: 'course',
            status: 'pending',
            userId: user.data.id,
        })
        // Step 4: Return the payment record
        await payment.save()

        return res.status(200).json({ payment, url: session.url })
    }
)

/**
 * @swagger
 * /materials/{materialId}/users/{username}:
 *   post:
 *     summary: Create a payment record for a user's material purchase
 *     tags:
 *       - Materials
 *     parameters:
 *       - name: materialId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the material
 *       - name: Username
 *         in: path
 *         required: true
 *         type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Payment record created successfully
 *         schema:
 *           type: object
 *           properties:
 *             materialId:
 *               type: string
 *             userId:
 *               type: string
 *       404:
 *         description: Material or user not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */
router.post(
    '/materials/:materialId/users/:username',
    async (req: Request, res: Response) => {
        const { materialId, username } = req.params

        // Step 1: Fetch the material from the database
        const material = getCourseById(materialId)
        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }
        // Step 2: Fetch the user from the database
        const userService = new UserService()
        const user = await userService
            .login()
            .then(() => userService.getUserByUsername(username))

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.data.email,
            line_items: [
                {
                    price_data: {
                        currency: material.currency,
                        product_data: {
                            name: material.name,
                        },
                        unit_amount: material.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
        })

        // Step 3: Create a payment record
        const payment = Payment.build({
            amount: material.price,
            currency: material.currency,
            referenceId: material.id,
            referenceType: 'material',
            status: 'pending',
            userId: user.data.id,
        })
        // Step 4: Return the payment record
        await payment.save()

        return res.status(200).json({ materialId, user, url: session.url })
    }
)

/**
 * @swagger
 * /history/users/{username}:
 *   get:
 *     summary: Get payment history for a user
 *     tags:
 *       - History
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             payments:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Payment'
 *       404:
 *         description: User or payments not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */
router.get('/history/users/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    // Step 1: Fetch the user from the database
    const userService = new UserService()
    const user = await userService
        .login()
        .then(() => userService.getUserByUsername(username))
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    // Step 2: Fetch the payment records for the user
    const payments = await Payment.find({
        userId: user.data.id,
    })
    if (!payments) {
        return res.status(404).json({ error: 'Payments not found' })
    }
    // Step 3: Return the payment records
    return res.status(200).json({ payments })
})

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all plans
 *     tags:
 *       - Plans
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             plan:
 *               $ref: '#/definitions/Plan'
 *       404:
 *         description: User or payment not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */

router.get('/plans', async (req: Request, res: Response) => {
    const plans = await PricePlan.find()
    if (!plans) {
        return res.status(404).json({ error: 'Plans not found' })
    }
    return res.status(200).json({ plans })
})

/**
 * @swagger
 * /{paymentId}/user/{username}:
 *   get:
 *     summary: Get a specific payment record for a user
 *     tags:
 *       - Payments
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the payment record
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Payment record retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             payment:
 *               $ref: '#/definitions/Payment'
 *       404:
 *         description: User or payment not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */
router.get(
    '/:paymentId/user/:username',
    async (req: Request, res: Response) => {
        const { paymentId, username } = req.params

        // Step 1: Fetch the user from the database
        const userService = new UserService()
        const user = await userService
            .login()
            .then(() => userService.getUserByUsername(username))
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        // Step 2: Fetch the payment record from the database
        const payment = await Payment.findOne({
            _id: paymentId,
            userId: user.data.id,
        }).exec()
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' })
        }
        // Step 3: Return the payment record
        return res.status(200).json({ payment })
    }
)

export default router
