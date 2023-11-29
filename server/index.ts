import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import './db/conn'
import './loadEnvironment'
import payments from './routes/payments'
import users from './routes/users'

const app: Express = express()

app.use(express.json())
app.use(cors())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World From the Typescript Server!')
})

const port = process.env.PORT ?? 8000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/users', users)
app.use('/payments', payments)
