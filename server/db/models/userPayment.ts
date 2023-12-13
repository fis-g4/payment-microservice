import mongoose from 'mongoose'

const { Schema } = mongoose

interface IUserPayment{
    userId: string;
    coins: number;
    planId: string;
    dateInit: Date;
}

interface UserPaymentDoc extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    coins: number;
    planId: string;
    dateInit: Date;
}

interface UserPaymentModelInterface extends mongoose.Model<UserPaymentDoc> {
    build(attr: IUserPayment): UserPaymentDoc;
}


const UserPaymentSchema = new Schema({
    userId: {
        type: String,
    },
    coins: {
        type: Number,
        //required: true,
    },
    planId: {
        type: String,
        //required: true,
    },
    dateInit: {
        type: Date,
        default: Date.now,
        //required: true,
    }
})

UserPaymentSchema.statics.build = (userPayment: IUserPayment) => {
    return new UserPayment(userPayment)
}

const UserPayment = mongoose.model<UserPaymentDoc, UserPaymentModelInterface>('UserPayment', UserPaymentSchema)

export { UserPayment }