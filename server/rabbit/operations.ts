import ampqlib, { Channel, Connection } from 'amqplib'
import axios from 'axios'

let channel: Channel, connection: Connection
const FIVE_HOURS = 1000 * 60 * 60 * 5

async function sendMessage(
    destination: string,
    operationId: string,
    message: string,
    API_KEY: string
) {
    try {
        await axios.post(
            `https://${process.env.API_DOMAIN}/v1/messages/${destination}`,
            {
                operationId,
                message,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            }
        )
    } catch (error) {
        console.log(error)
    }
}

async function receiveMessages(queue: string) {
    try {
        const ampqServer = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBIT_SERVER_IP}:5672`
        connection = await ampqlib.connect(ampqServer)
        channel = await connection.createChannel()
        await channel.consume(queue, async (data) => {
            console.info(`Received ${Buffer.from(data!.content)}`)
            handleMessages(data!.content.toString())
            channel.ack(data!)
        })
    } catch (error) {
        console.log(error)
    }
}

async function handleMessages(message: string) {}

export { receiveMessages, sendMessage }
