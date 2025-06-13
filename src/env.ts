import process from 'node:process'
import 'dotenv/config'

export const env = {
    PORT: +(process.env.PORT || 8000)
}
