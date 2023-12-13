import { PricePlan } from './models/plan';
import { User } from './models/user';

function populateUsers() {
    User.build({
        name: 'Maria Doe',
        email: 'maria@example.com',
        password: 'maria123',
        roles: ['admin', 'user'],
    }).save();
    
    User.build({
        name: 'Juan Doe',
        email: 'juan@example.com',
        password: 'juan123',
        roles: ['user'],
    }).save();
}

function populatePlans() {
    PricePlan.build({
        name: 'Basic',
        description: 'Basic plan',
        price: 0,
        currency: 'eur',
        features:  new Array('Access to free courses', 'Access to free materials'),
    }).save();

    PricePlan.build({
        name: 'Premium',
        description: 'Premium plan',
        price: 10,
        currency: 'eur',
        features:  new Array('Access to all courses', 'Access to all materials'),
    }).save();

}


async function populateDB() {

    console.log('Populating DB...');
    
    if (process.env.NODE_ENV !== 'production') {

        User.collection.countDocuments().then((count) => {
            if (count === 0) {
                populateUsers()
            }
        })

        PricePlan.collection.countDocuments().then((count) => {
            if (count === 0) {
                populatePlans()
            }
        })
    }

    console.log('Populated!');
}

export default populateDB;