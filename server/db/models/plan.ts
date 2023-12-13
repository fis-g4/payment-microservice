import mongoose from 'mongoose';


const { Schema } = mongoose;

interface IPricePlan{
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
}

interface PricePlanDoc extends mongoose.Document {
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
}

interface PricePlanModelInterface extends mongoose.Model<PricePlanDoc> {
    build(attr: IPricePlan): PricePlanDoc;
}

const pricePlanSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    features: {
        type: [String],
        required: true,
    },
})


pricePlanSchema.statics.build = (pricePlan: IPricePlan) => {
    return new PricePlan(pricePlan)
}

const PricePlan = mongoose.model<PricePlanDoc, PricePlanModelInterface>('PricePlan', pricePlanSchema);

export { PricePlan };