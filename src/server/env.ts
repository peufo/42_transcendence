import process from 'node:process'
import 'dotenv/config'

if (!process.env.DB_FILE_NAME)
	throw new Error('DB_FILE_NAME environment value is required')
if (!process.env.COOKIE_SECRET)
	throw new Error('COOKIE_SECRET environment value is required')
if (!process.env.GOOGLE_CLIENT_ID)
	throw new Error('GOOGLE_CLIENT_ID environment value is required')
if (!process.env.GOOGLE_SECRET)
	throw new Error('GOOGLE_SECRET environment value is required')
if (!process.env.FILE_CERT || !process.env.FILE_KEY) {
	console.warn(
		'Warning, you need to set FILE_CERT and FILE_KEY environment value to use https !',
	)
}

export const env = {
	PORT: +(process.env.PORT || 8000),
	MEDIA_DIR: process.env.MEDIA_DIR || './upload',
	APP_HOST: process.env.APP_HOST || '0.0.0.0',
	DB_FILE_NAME: process.env.DB_FILE_NAME,
	COOKIE_SECRET: process.env.COOKIE_SECRET,
	dev: process.env.NODE_ENV === 'development',
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_SECRET: process.env.GOOGLE_SECRET,
	FILE_CERT: process.env.FILE_CERT,
	FILE_KEY: process.env.FILE_KEY,
} as const
