import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { schemaBody } from '../../utils.js'
import { createTournament } from './model.js'
import { tournamentSchema } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	// 	<RouteGenericInterface, unknown, {
	//     body: z.ZodObject<{
	//         numberOfPlayers: z.ZodCoercedNumber<unknown>;
	//     }, z.core.$strip>;
	//     response: {
	//         200: z.ZodObject<ZodShape<{
	//             success: boolean;
	//         }>, z.core.$strip>;
	//     };
	// }

	server.post('/new', schemaBody(tournamentSchema), async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const tournament = await createTournament({
			...req.body,
			createdBy: user.id,
		})

		return res.send({ success: true, tournamentId: tournament.id })
	})

	done()
}
