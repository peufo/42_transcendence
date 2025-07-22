import crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { FastifyReply } from 'fastify'
import { db, sessions } from '../../db/index.js'
import type { DB } from '../../types.ts'

export async function setSessionCookie(userId: number, res: FastifyReply) {
	const { token } = await createSession(userId)
	res.setCookie('session', token, { path: '/', signed: true })
}

const SESSION_INACTIVITY_TIMOUT = 1000 * 60 * 60 * 24 // 1 days
const SESSION_ACTIVITY_CHECK_INTERVAL = 1000 * 60 * 60 // 1 hour

type SessionWithToken = DB.Session & {
	token: string
}

function generateSecureRandomString(len = 24): string {
	const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789'
	const bytes = new Uint8Array(len)
	crypto.getRandomValues(bytes)
	let id = ''
	for (const byte of bytes) {
		id += alphabet[byte >> 3] // 2**5 = 32 and 32 < alphabet.length(33)
	}
	return id
}

// TODO: use argon2id instead ?
async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret)
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes)
	return new Uint8Array(secretHashBuffer)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false
	}
	let c = 0
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i]
	}
	return c === 0
}

async function createSession(userId: number): Promise<SessionWithToken> {
	const now = new Date()
	const id = generateSecureRandomString()
	const secret = generateSecureRandomString()
	const secretHash = await hashSecret(secret)
	const token = `${id}.${secret}`
	const session: DB.Session = {
		id,
		userId,
		secretHash,
		createdAt: now,
		lastVerifiedAt: now,
	}
	await db.insert(sessions).values(session)
	return { ...session, token }
}

export async function validateSessionToken(
	token: string,
): Promise<DB.Session | null> {
	const tokenParts = token.split('.')
	if (tokenParts.length !== 2) {
		return null
	}
	const [sessionId, sessionSecret] = tokenParts
	const session = await getSession(sessionId)
	if (!session) {
		return null
	}
	const tokenSecretHash = await hashSecret(sessionSecret)
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash)
	if (!validSecret) {
		return null
	}
	const now = new Date()
	const elapsedTime = now.getTime() - session.lastVerifiedAt.getTime()
	if (elapsedTime >= SESSION_ACTIVITY_CHECK_INTERVAL) {
		session.lastVerifiedAt = now
		await db
			.update(sessions)
			.set({ lastVerifiedAt: now })
			.where(eq(sessions.id, sessionId))
	}
	return session
}

async function getSession(sessionId: string): Promise<DB.Session | null> {
	const now = new Date()
	const [session] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId))
	if (!session) {
		return null
	}
	const elapsedTime = now.getTime() - session.lastVerifiedAt.getTime()
	if (elapsedTime >= SESSION_INACTIVITY_TIMOUT) {
		return await deleteSession(sessionId)
	}
	return session
}

async function deleteSession(sessionId: string): Promise<null> {
	await db.delete(sessions).where(eq(sessions.id, sessionId))
	return null
}
