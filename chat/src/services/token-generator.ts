import jwt from 'jsonwebtoken'

export function generateToken(id: string, email: string) {
    const token = jwt.sign({
        id: id,
        email: email
    }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })
    console.log(token)
    return token
}