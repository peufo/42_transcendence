import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { getUserBasic } from '../friendships/model.js'
import { emitterMaps, notify, notifyFriends } from '../ws/controller.js'
import {
	isTournamentEmptyAndOpen,
	tournamentCreate,
	tournamentDelete,
	tournamentGet,
	tournamentJoin,
	tournamentQuit,
	tournamentStart,
} from './model.js'
import { tournamentIdSchema, tournamentSchemaCreate } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/',
		getSchema('/tournaments', tournamentIdSchema),
		async (req, res) => {
			permission.user(res)
			const { tournamentId } = req.query
			const tournament = await tournamentGet(tournamentId)
			return res.send({ data: tournament })
		},
	)

	server.post(
		'/new',
		postSchema('/tournaments/new', tournamentSchemaCreate),
		async (req, res) => {
			const { userId } = permission.session(res)
			const tournament = await tournamentCreate({
				...req.body,
				createdBy: userId,
			})
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
			notify.tournaments(tournament.id, 'onParticipantJoin', { user })
			return res.send({ success: true, tournamentId: tournament.id })
		},
	)

	server.post(
		'/join',
		postSchema('/tournaments/join', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			const { tournament } = await tournamentJoin(tournamentId, userId)
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
			notify.tournaments(tournamentId, 'onParticipantJoin', { user })

			res.send({ success: true, tournamentId })
		},
	)

	server.post(
		'/start',
		postSchema('/tournaments/start', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			const tournament = await tournamentGet(tournamentId)
			if (tournament.participants[0].user.id !== userId)
				return res.send({
					success: false,
					message: 'Only first player can start',
				})
			const emitter = emitterMaps.tournaments?.get(tournamentId)
			if (!emitter) return res.send({ success: false, message: 'WTF' })
			const isEveryoneHere = tournament.participants.every((participant) => {
				return emitter.payload?.users.has(participant.user.id)
			})
			if (!isEveryoneHere)
				return res.send({
					success: false,
					message: 'Not every player is connected to the tournament',
				})
			await tournamentStart(tournamentId)
			res.send({ success: true, message: 'Tournament started' })
		},
	)

	server.post(
		'/quit',
		postSchema('/tournaments/quit', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			await tournamentQuit(tournamentId, userId)
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentQuit', { userId: userId })
			notify.tournaments(tournamentId, 'onParticipantQuit', { user })
			if (await isTournamentEmptyAndOpen(tournamentId))
				await tournamentDelete(tournamentId)
			return res.send({ success: true })
		},
	)

	done()
}
