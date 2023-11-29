const users = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
    },
]

export const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
}
