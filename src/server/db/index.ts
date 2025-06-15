import { drizzle } from 'drizzle-orm/libsql'
import { env } from '../env.js'

export * from './schema.js'
export const db = drizzle(env.DB_FILE_NAME)
