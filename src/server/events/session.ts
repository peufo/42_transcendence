import { EventEmitter } from 'node:events'
import { eq } from 'drizzle-orm'
import type { SessionEvent } from '../../lib/type.js'
import { db, sessions } from '../db/index.js'

type EventMap<T extends Record<string, unknown>> = { [K in keyof T]: [T[K]] }
type SessionEventEmitter = EventEmitter<EventMap<SessionEvent>>

const sessionsEvent = new Map<string, SessionEventEmitter>()

export function createSessionEvent(sessionId: string): SessionEventEmitter {
	const sessionEvent = sessionsEvent.get(sessionId)
	if (sessionEvent) return sessionEvent
	const newSessionEvent: SessionEventEmitter = new EventEmitter()
	sessionsEvent.set(sessionId, newSessionEvent)
	return newSessionEvent
}

export function removeSessionEvent(sessionId: string) {
	sessionsEvent.delete(sessionId)
}

export async function notifyUser<K extends keyof SessionEvent>(
	userId: number,
	eventName: K,
	data: SessionEvent[K],
) {
	const invitedSessions = await db.query.sessions.findMany({
		where: eq(sessions.userId, userId),
		columns: { id: true },
	})
	for (const { id: invitedSessionid } of invitedSessions) {
		const sessionEvent = sessionsEvent.get(invitedSessionid)
		// @ts-ignore
		sessionEvent?.emit(eventName, data)
	}
}
