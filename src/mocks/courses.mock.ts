const courses = [
    {
        id: '1',
        name: 'Course 1',
        description: 'Description 1',
        price: 0,
        currency: 'eur',
    },
]

export const getCourseById = (id: string) => {
    return courses.find((course) => course.id === id)
}
