import express, { Request, Response } from 'express'
import { Payment } from '../db/models/payment'
import { PricePlan } from '../db/models/plan'
import { User } from '../db/models/user'
import { UserPayment } from '../db/models/userPayment'
import { getCourseById } from '../mocks/courses.mock'


const router = express.Router()

router.post('/plans/:planId/users/:userId',
    async (req: Request, res: Response) => {
        const { planId, userId } = req.params

        // Step 1: Fetch the plan from the database
        const plan = await PricePlan.findOne({ where: { id: planId } }).exec();
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({ where: { id: userId } }).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
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
        const userPayment = await UserPayment.findOne({ where: { userId: user.id } }).exec();
        if (!userPayment) {
            const newUserPayment = UserPayment.build({
                userId: user.id,
                planId: plan.id,
                coins: 0,
                dateInit: new Date()
            })

            await newUserPayment.save()

            return res.status(200).json({ payment })
        }

        userPayment.planId = plan.id

        await userPayment.save()

        return res.status(200).json({ payment })
    }
)

router.post('/courses/:courseId/users/:userId',
    async (req: Request, res: Response) => {
        const { courseId, userId } = req.params

        // Step 1: Fetch the course from the database
        const course = getCourseById(courseId)
        if (!course) {
            return res.status(404).json({ error: 'Course not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({ where: { id: userId } }).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
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

        return res.status(200).json({ payment })
    }
)

router.post('/materials/:materialId/users/:userId',
    async (req: Request, res: Response) => {
        const { materialId, userId } = req.params

        // Step 1: Fetch the material from the database
        const material = getCourseById(materialId)
        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }
        // Step 2: Fetch the user from the database
        const user = await User.findOne({ where: { id: userId } }).exec()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
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

        return res.status(200).json({ materialId, userId })
    }
)

router.get('/history/users/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params

    // Step 1: Fetch the user from the database
    const user = await User.findOne({ where: { id: userId } }).exec();
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    // Step 2: Fetch the payment records for the user
    const payments = await Payment.find({ where: { userId: user.id } })
    if (!payments) {
        return res.status(404).json({ error: 'Payments not found' })
    }
    // Step 3: Return the payment records
    return res.status(200).json({ payments })
})

router.get('/:paymentId/user/:userId', async (req: Request, res: Response) => {
    const { paymentId, userId } = req.params

    // Step 1: Fetch the user from the database
    const user = await User.findOne({ where: { id: userId } }).exec();
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    // Step 2: Fetch the payment record from the database
    const payment = await Payment.findOne({ where: { id: paymentId, userId: userId } }).exec();
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' })
    }
    // Step 3: Return the payment record
    return res.status(200).json({ payment })
})

export default router
