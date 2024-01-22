import express, { Request, Response } from 'express'

const router = express.Router()

/**
 * @swagger
 * /plans:
 * get:
 *  summary: Get all plans
 * tags:
 * - Plans
 */

router.get('/', async (req: Request, res: Response) => {
    return res.status(200).json({ status: 'ok' })
})

export default router
