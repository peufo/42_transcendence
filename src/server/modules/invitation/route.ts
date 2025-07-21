import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
	acceptInvitationController,
	cancelInvitationController,
	listInvitationsController,
	newInvitationController,
	removeFriendController,
} from './controller.js'
import {
	acceptInvitationSchema,
	cancelInvitationSchema,
	newInvitationSchema,
	removeFriendSchema,
} from './schema.js'

export const invitationsRoute: FastifyPluginCallbackZod = (server,_opts,done,) => 
{
	server.get('/', listInvitationsController)
	server.post('/accept',{ schema: { body: acceptInvitationSchema } },acceptInvitationController,)
	server.post('/new',{ schema: { body: newInvitationSchema } },newInvitationController,)
	server.post('/cancel',{ schema: { body: cancelInvitationSchema } },cancelInvitationController,)
	server.post('/remove',{ schema: { body: removeFriendSchema } },removeFriendController,)

	done()
}
