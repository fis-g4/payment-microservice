import { GoogleAuth } from 'google-auth-library'

const authCredentials = new GoogleAuth({
    keyFilename: '../GoogleCloudKey.json',
})

function verifyToken(url: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        authCredentials
            .getIdTokenClient(process.env.GCF_VERIFY_TOKEN_ENDPOINT ?? '')
            .then((client) => {
                client
                    .request({
                        method: 'POST',
                        url: process.env.GCF_VERIFY_TOKEN_ENDPOINT ?? '',
                        data: {
                            url: url,
                            token: token,
                        },
                    })
                    .then((response) => {
                        let data: any = response.data
                        let payload = data.data

                        resolve(payload)
                    })
                    .catch((err) => {
                        let statusCode = err.response.status
                        let message = err.response.data.error

                        reject({ statusCode, message })
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

function generateToken(user: any) {
    return new Promise((resolve, reject) => {
        authCredentials
            .getIdTokenClient(process.env.GCF_GENERATE_TOKEN_ENDPOINT ?? '')
            .then((client) => {
                client
                    .request({
                        method: 'POST',
                        url: process.env.GCF_GENERATE_TOKEN_ENDPOINT ?? '',
                        data: {
                            payload: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                username: user.username,
                                email: user.email,
                                profilePicture: user.profilePicture,
                                coinsAmount: user.coinsAmount,
                                role: user.role,
                                plan: user.plan,
                            },
                        },
                    })
                    .then((response) => {
                        let data: any = response.data
                        let token = data.data

                        resolve(token)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
    })
}

export { generateToken, verifyToken }
