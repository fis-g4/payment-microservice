const users = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
        roles: ['admin', 'user'],
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
        roles: ['user'],
    },
]

export const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
}
