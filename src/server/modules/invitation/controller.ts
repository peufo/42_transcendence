import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	acceptInvitation,
	cancelInvitation,
	getUserInvitations,
	removeFriend,
	sendInvitation,
} from './service.js'
import '../../types.js'
import { requireUser } from '../../utils/auth.js'
import { HttpError } from '../../utils/HttpError.js'

export async function listInvitationsController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const data = await getUserInvitations(user.id)
	return res.send({ data })
}

export async function acceptInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const { friendshipId } = req.body as { friendshipId: number }

	const success = await acceptInvitation(friendshipId, user.id)
	if (!success) {
		throw new HttpError('Invitation not found or already accepted', 404)
	}

	return res.send({ success })
}

export async function newInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const { invitedUserId } = req.body as { invitedUserId: number }

	const success = await sendInvitation(user.id, invitedUserId)
	if (!success) {
		throw new HttpError('Invitation already exists or user invalid', 409)
	}

	return res.send({ success })
}

export async function cancelInvitationController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const { friendshipId } = req.body as { friendshipId: number }

	const success = await cancelInvitation(friendshipId)
	if (!success) {
		throw new HttpError('Invitation not found or cannot be canceled', 404)
	}

	return res.send({ success })
}

export async function removeFriendController(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const { friendId } = req.body as { friendId: number }

	const success = await removeFriend(user.id, friendId)
	if (!success) {
		throw new HttpError('Friend not found or not removable', 404)
	}
	return res.send({ success })

}
