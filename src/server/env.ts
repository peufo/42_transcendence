import process from 'node:process'
import 'dotenv/config'

if (!process.env.DB_FILE_NAME)
	throw new Error('DB_FILE_NAME environment value is required')

export const env = {
	PORT: +(process.env.PORT || 8000),
	APP_HOST: process.env.APP_HOST || '0.0.0.0',
	DB_FILE_NAME: process.env.DB_FILE_NAME,
}
