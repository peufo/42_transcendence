import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	acceptInvitation,
	cancelInvitation,
	getUserInvitations,
	removeFriend,
	sendInvitation,
} from './service.js'

import '../../types.js'

export async function listInvitationsController(
	_req: FastifyRequest,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()
	const data = await getUserInvitations(user.id)
	return res.send({ data })
}

export async function acceptInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()
	const { friendshipId } = req.body as { friendshipId: number }
	const success = await acceptInvitation(friendshipId, user.id)
	if (!success) return res.code(400).send()
	return res.send({ success })
}

export async function newInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()
	const { invitedUserId } = req.body as { invitedUserId: number }
	const success = await sendInvitation(user.id, invitedUserId)
	if (!success) return res.code(400).send()
	return res.send({ success })
}

export async function cancelInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()
	const { friendshipId } = req.body as { friendshipId: number }
	const success = await cancelInvitation(friendshipId)
	if (!success) return res.code(400).send()
	return res.send({ success })
}

export async function removeFriendController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()
	const { friendId } = req.body as { friendId: number }
	const success = await removeFriend(user.id, friendId)
	if (!success) return res.code(400).send()
	return res.send({ success })
}
