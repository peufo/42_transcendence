import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './drizzle',
	dialect: 'sqlite',
	schema: './src/server/db/schema.ts',
	dbCredentials: {
		url: process.env.DB_FILE_NAME!,
	},
})
