import { z } from 'zod'

export const acceptInvitationSchema = z.object({
	friendshipId: z.coerce.number(),
})

export const newInvitationSchema = z.object({
	invitedUserId: z.coerce.number(),
})

export const cancelInvitationSchema = z.object({
	friendshipId: z.coerce.number(),
})

export const removeFriendSchema = z.object({
	friendId: z.coerce.number(),
})
