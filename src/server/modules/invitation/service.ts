import {
	acceptFriendship,
	cancelFriendship,
	createFriendship,
	findInvitations,
	removeFriendship,
} from './model.js'

export async function getUserInvitations(userId: number) {
	const res = await findInvitations(userId)
	return res.map((r) => {
		const friendship = {
			createdBy: r.createdBy,
			createdAt: r.createdAt,
			friendshipId: r.id,
		}
		return r.user1Id === userId
			? { ...friendship, ...r.user2 }
			: { ...friendship, ...r.user1 }
	})
}

export async function acceptInvitation(friendshipId: number, userId: number) {
	const result = await acceptFriendship(friendshipId, userId)
	return result.rowsAffected > 0
}

export async function sendInvitation(userId: number, invitedUserId: number) {
	const result = await createFriendship(userId, invitedUserId)
	return result.rowsAffected > 0
}

export async function cancelInvitation(friendshipId: number) {
	const result = await cancelFriendship(friendshipId)
	return result.rowsAffected > 0
}

export async function removeFriend(userId: number, friendId: number) {
	const result = await removeFriendship(userId, friendId)
	return result.rowsAffected > 0
}
