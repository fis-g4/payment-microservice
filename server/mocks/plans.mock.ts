const basicPlan = {
    id: 'basic',
    name: 'Basic',
    description: 'Basic plan',
    price: 0,
    currency: 'eur',
    features: ['Access to free courses', 'Access to free materials'],
}

const premiumPlan = {
    id: 'premium',
    name: 'Premium',
    description: 'Premium plan',
    price: 10,
    currency: 'eur',
    features: [
        'Access to all courses',
        'Access to all materials',
        'Access to premium support',
    ],
}

const plans = [basicPlan, premiumPlan]

export const getPlanById = (id: string) => {
    return plans.find((plan) => plan.id === id)
}
