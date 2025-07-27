import { EventEmitter } from 'node:events'
import type { FriendshipEvents } from '../../../lib/type.js'
import type { EventMap } from './controller.js'

type FriendshipEmitter = EventEmitter<EventMap<FriendshipEvents>>

const userEmitterMap = new Map<number, FriendshipEmitter>()

export function createUserEmitter(userId: number): FriendshipEmitter {
	const userEmitter = userEmitterMap.get(userId)
	if (userEmitter) return userEmitter
	const newUserEmitter: FriendshipEmitter = new EventEmitter()
	userEmitterMap.set(userId, newUserEmitter)
	return newUserEmitter
}

export function removeUserEmitter(userId: number) {
	userEmitterMap.delete(userId)
}

export async function notifyUser<K extends keyof FriendshipEvents>(
	userId: number,
	eventName: K,
	data: FriendshipEvents[K],
) {
	const userEmitter = userEmitterMap.get(userId)
	// @ts-ignore
	userEmitter?.emit(eventName, data)
}
