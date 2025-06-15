import process from 'node:process'
import 'dotenv/config'

if (!process.env.SESSION_KEY)
    throw Error('SESSION_KEY environment value is required')

export const env = {
    PORT: +(process.env.PORT || 8000),
    SESSION_KEY: process.env.SESSION_KEY
}
