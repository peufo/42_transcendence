import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (!process.env.DB_FILE_NAME) {
	throw new Error('DB_FILE_NAME environment value is required')
}

export default defineConfig({
	out: './drizzle',
	dialect: 'sqlite',
	schema: './src/server/db/schema.ts',
	dbCredentials: {
		url: process.env.DB_FILE_NAME,
	},
})
