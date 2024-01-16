import axios from 'axios'

export class UserService {
    private apiUrl: string | undefined
    private username: string | undefined
    private password: string | undefined
    private token: string | undefined

    constructor() {
        this.apiUrl = process.env.USER_SERVICE_BASE_URL
        this.username = process.env.USER_SERVICE_USERNAME
        this.password = process.env.USER_SERVICE_PASSWORD
    }

    async login() {
        console.table({
            apiUrl: this.apiUrl,
            username: this.username,
            password: this.password,
        })

        try {
            console.log('Lets login')
            const response = await axios.post(`${this.apiUrl}/login`, {
                username: this.username,
                password: this.password,
            })

            console.log('Response:', response.data)

            if (response && response.data && response.data) {
                this.token = response.data
                console.log('Login successful. Token obtained.')
            } else {
                console.log('Login failed. Token not obtained.')
            }
        } catch (error: any) {
            console.error('Error during login:', error.message)
        }
    }

    async getUserByUsername(userName: string) {
        try {
            if (!this.token) {
                console.error('Please login first.')
                return null
            }

            const response = await axios.get(
                `${this.apiUrl}/users/${userName}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            )

            if (response && response.data) {
                console.log('User details obtained:', response.data)
                return response.data as UserReponse
            } else {
                console.log('User details not found.')
                return null
            }
        } catch (error: any) {
            console.error('Error getting user details:', error.message)
            return null
        }
    }

    async update(userName: string, body: UpdateBody) {
        try {
            if (!this.token) {
                console.error('Please login first.')
                return null
            }

            const response = await axios.put(
                `${this.apiUrl}/users/${userName}`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            )

            if (response && response.data) {
                console.log('User details updated:', response.data)
                return response.data as UserReponse
            } else {
                console.log('User details not updated.')
                return null
            }
        } catch (error: any) {
            console.error('Error updating user details:', error.message)
            return null
        }
    }
}

interface UpdateBody {
    plan: string
}

interface UserReponse {
    data: {
        id: string
        firstName: string
        lastName: string
        userName: string
        email: string
        plan: string
        role: string
    }
}
