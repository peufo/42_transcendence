import { drizzle } from 'drizzle-orm/libsql'
import { env } from '../env.js'
import * as schema from './schema.js'

export const db = drizzle(env.DB_FILE_NAME, { schema })
export * from './schema.js'
