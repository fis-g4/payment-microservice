import mongoose from 'mongoose'

const { Schema } = mongoose

interface IPayment {
    userId: string
    referenceType: string
    referenceId: string
    currency: string
    amount: number
    status: string
}

interface PaymentDoc extends mongoose.Document {
    userId: string
    referenceType: string
    referenceId: string
    currency: string
    amount: number
    status: string
}

interface PaymentModelInterface extends mongoose.Model<PaymentDoc> {
    build(attr: IPayment): PaymentDoc
}

const paymentSchema = new Schema({
    userId: {
        type: String,
    },
    referenceType: {
        type: String,
    },
    referenceId: {
        type: String,
    },
    currency: {
        type: String,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
    },
})

paymentSchema.statics.build = (payment: IPayment) => {
    return new Payment(payment)
}

const Payment = mongoose.model<PaymentDoc, PaymentModelInterface>(
    'Payment',
    paymentSchema
)

export { Payment }
