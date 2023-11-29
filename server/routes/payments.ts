import express, { Request, Response } from 'express'
import { Payment } from '../db/models/payment'
import { getPlanById } from '../mocks/plans.mock'
import { getUserById } from '../mocks/users.mock'

const router = express.Router()

router.post(
    '/plans/:planId/users/:userId',
    async (req: Request, res: Response) => {
        const { planId, userId } = req.params

        // Step 1: Fetch the plan from the database
        const plan = getPlanById(planId)
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' })
        }
        // Step 2: Fetch the user from the database
        const user = getUserById(userId)
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

        return res.status(200).json({ payment })
    }
)

router.post(
    '/courses/:courseId/users/:userId',
    async (req: Request, res: Response) => {
        const { courseId, userId } = req.params

        // Step 1: Fetch the course from the database
        // Step 2: Fetch the user from the database
        // Step 3: Create a payment record
        // Step 4: Return the payment record

        return res.status(200).json({ courseId, userId })
    }
)

router.post(
    '/materials/:materialId/users/:userId',
    async (req: Request, res: Response) => {
        const { materialId, userId } = req.params

        // Step 1: Fetch the material from the database
        // Step 2: Fetch the user from the database
        // Step 3: Create a payment record
        // Step 4: Return the payment record

        return res.status(200).json({ materialId, userId })
    }
)

router.get('/users/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params

    // Step 1: Fetch the user from the database
    // Step 2: Fetch the payment records for the user
    // Step 3: Return the payment records

    return res.status(200).json({ userId })
})

export default router
