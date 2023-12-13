import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import swaggerjsdoc from 'swagger-jsdoc'
import swaggerui from 'swagger-ui-express'
import './db/conn'
import './loadEnvironment'
import payments from './routes/payments'
import users from './routes/users'

export const app: Express = express()

app.use(express.json())
app.use(cors())

const swaggerJsDoc = swaggerjsdoc
const swaggerUI = swaggerui

const swaggerOptions = {
    definition: {
        openapi: '3.1.0',
        info: {
            version: '1.0.0',
            title: 'Payment Microservice API',
            description:
                'API for the users microservice of the FIS-G4 project.',
            contact: {
                name: 'Vicente Cambrón Tocados & Youseff Laccouf',
                email: '',
                url: 'https://github.com/fis-g4/payment-microservice',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: process.env.BASE_URL ?? 'http://localhost:8000/v1/',
            },
        ],
        components: {
            // securitySchemes: {
            //     bearerAuth: {
            //         type: 'http',
            //         scheme: 'bearer',
            //         bearerFormat: 'JWT',
            //     },
            // },
        },
        security: [
            // {
            //     bearerAuth: [],
            // },
        ],
    },
    apis: ['./routes/payments.ts', './routes/plans.ts'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World From the Typescript Server!')
})

const port = process.env.PORT ?? 8000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/users', users)
app.use('/payments', payments)
// app.use('/plans', plans)
app.use(
    '/v1/docs/',
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocs, { explorer: true })
)
