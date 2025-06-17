import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.js'
import { env } from '../env.js'

export const db = drizzle(env.DB_FILE_NAME, { schema })
export * from './schema.js'
