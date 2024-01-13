import express, { Request, Response } from 'express'
import { Payment } from '../db/models/payment'
import { PricePlan } from '../db/models/plan'
import { User } from '../db/models/user'
import { UserPayment } from '../db/models/userPayment'
import { getCourseById } from '../mocks/courses.mock'

const router = express.Router()

const stripeConnection = {
    secret_key:
        'sk_test_51OXsgTISDBC7fkZuLw1pwE7249wluuvRnstv9uMmQkbWOU4TQXlixTiHSly0d2K4I4EtLqAWE25Y82JXmMhSn0Mu008EMn25A2',
    publishable_key:
        'pk_test_51OXsgTISDBC7fkZurQeBgzi2BdqnreHI09SneCemzY9bKOYQcuR6Ha8GjhmobvD6L1qVc0E2KwTCz7gy9w5S3sik00NnJGLCKt',
}

const stripe = require('stripe')(stripeConnection.secret_key)

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payments management API
 */

/**
 * @swagger
 * /payments/plans/{planId}/users/{userId}:
 *   post:
 *     summary: Create a payment record for a user's plan
 *     tags:
 *       - Payments
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the plan
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Payment record created successfully
 *         schema:
 *           type: object
 *           properties:
 *             payment:
 *               $ref: '#/definitions/Payment'
 *       400:
 *         description: There was an error with the request
 *         schema:
 *           $ref: '#/definitions/Error400'
 *       404:
 *         description: Plan or user not found
 *         schema:
 *           $ref: '#/definitions/Error404'
 *       500:
 *         description: Some server error
 *         schema:
 *           $ref: '#/definitions/Error500'
 */
router.post(
    '/plans/:planId/users/:userId',
    async (req: Request, res: Response) => {
        const { planId, userId } = req.params

        // Step 1: Fetch the plan from the database
        const plan = await PricePlan.findOne({
            _id: planId,
        })
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({
            _id: userId,
        }).exec()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Step 3: Generate a Stripe Link
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: plan.currency,
                        product_data: {
                            name: plan.name,
                        },
                        unit_amount: plan.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
        })

        console.log(session)

        // Step 3: Create a payment record
        const payment = Payment.build({
            amount: plan.price,
            currency: plan.currency,
            referenceId: plan.id,
            referenceType: 'plan',
            status: 'pending',
            userId: user.id,
        })
        // Step 4: Return the payment record
        await payment.save()

        // Step 4 bis: Update the user's plan
        const userPayment = await UserPayment.findOne({
            userId: user.id,
        }).exec()
        if (!userPayment) {
            const newUserPayment = UserPayment.build({
                userId: user.id,
                planId: plan.id,
                coins: 0,
                dateInit: new Date(),
            })

            await newUserPayment.save()

            return res.status(200).json({ payment })
        }

        userPayment.planId = plan.id

        await userPayment.save()

        return res.status(200).json({ payment, url: session.url })
    }
)

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
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the user
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
    '/courses/:courseId/users/:userId',
    async (req: Request, res: Response) => {
        const { courseId, userId } = req.params

        // Step 1: Fetch the course from the database
        const course = getCourseById(courseId)
        if (!course) {
            return res.status(404).json({ error: 'Course not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({
            _id: userId,
        }).exec()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: course.currency,
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
            currency: course.currency,
            referenceId: course.id,
            referenceType: 'course',
            status: 'pending',
            userId: user.id,
        })
        // Step 4: Return the payment record
        await payment.save()

        return res.status(200).json({ payment, url: session.url })
    }
)

/**
 * @swagger
 * /materials/{materialId}/users/{userId}:
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
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the user
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
    '/materials/:materialId/users/:userId',
    async (req: Request, res: Response) => {
        const { materialId, userId } = req.params

        // Step 1: Fetch the material from the database
        const material = getCourseById(materialId)
        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({
            _id: userId,
        }).exec()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
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
            userId: user.id,
        })
        // Step 4: Return the payment record
        await payment.save()

        return res.status(200).json({ materialId, userId, url: session.url })
    }
)

/**
 * @swagger
 * /history/users/{userId}:
 *   get:
 *     summary: Get payment history for a user
 *     tags:
 *       - History
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the user
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
router.get('/history/users/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params

    // Step 1: Fetch the user from the database
    const user = await User.findOne({
        _id: userId,
    }).exec()
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    // Step 2: Fetch the payment records for the user
    const payments = await Payment.find({
        userId: userId,
    })
    if (!payments) {
        return res.status(404).json({ error: 'Payments not found' })
    }
    // Step 3: Return the payment records
    return res.status(200).json({ payments })
})

/**
 * @swagger
 * /{paymentId}/user/{userId}:
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
 *         description: ID of the user
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
router.get('/:paymentId/user/:userId', async (req: Request, res: Response) => {
    const { paymentId, userId } = req.params

    // Step 1: Fetch the user from the database
    const user = await User.findOne({
        _id: userId,
    }).exec()
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    // Step 2: Fetch the payment record from the database
    const payment = await Payment.findOne({
        _id: paymentId,
        userId: userId,
    }).exec()
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' })
    }
    // Step 3: Return the payment record
    return res.status(200).json({ payment })
})

export default router
