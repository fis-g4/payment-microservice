import axios from 'axios'

export class CourseService {
    private apiUrl: string | undefined
    private username: string | undefined
    private password: string | undefined
    private token: string | undefined

    constructor() {
        this.apiUrl = process.env.COURSE_SERVICE_BASE_URL
        this.username = process.env.USER_SERVICE_USERNAME
        this.password = process.env.USER_SERVICE_PASSWORD
    }

    async login() {
        try {
            console.log('Lets login')
            const response = await axios.post(`${this.apiUrl}/login`, {
                username: this.username,
                password: this.password,
            })

            if (response && response.data && response.data.data) {
                this.token = response.data.data.token
                console.log('Login successful. Token obtained.')
            } else {
                console.log('Login failed. Token not obtained.')
            }
        } catch (error: any) {
            console.error('Error during login:', error.message)
        }
    }

    async getCourseById(courseId: string) {
        try {
            if (!this.token) {
                console.error('Please login first.')
                return null
            }

            const response = await axios.get(`${this.apiUrl}/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            })

            if (response && response.data) {
                console.log('Course details obtained:', response.data)
                return response.data as CourseReponse
            } else {
                console.log('Course details not found.')
                return null
            }
        } catch (error: any) {
            console.error('Error getting course details:', error.message)
            return null
        }
    }
}

interface CourseReponse {
    id: string
    name: string
    description: string
    price: number
    createdAt: Date
    updatedAt: Date
}
