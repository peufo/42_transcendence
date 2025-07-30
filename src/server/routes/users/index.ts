import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { searchUsersAsNotFriends, updateUser } from './model.js'
import { updateUserSchema } from './schema.js'

export const usersRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/',
		getSchema('/users', { search: z.string().default('') }),
		async (req, res) => {
			const user = permission.user(res)
			const users = await searchUsersAsNotFriends(user.id, req.query.search)
			return res.send({ data: users })
		},
	)

	server.post(
		'/update',
		postSchema('/users/update', updateUserSchema),
		async (req, res) => {
			const user = permission.user(res)

			const updatedUser = await updateUser(user.id, req.body)

			return res.send({
				message: 'Updated with success',
				success: true,
				user: updatedUser,
			})
		},
	)

	server.post('/update/avatar', async (req, res) => {
		// @ts-ignore
		const data = await req.file()
		if (!data || data.fieldname !== 'avatarFile') {
			return res.status(400).send({
				message: 'No avatar file provided',
				sucess: false,
			})
		}

		// const user = permission.user(res)
		// TODO: use user id for filename
		await pipeline(
			data.file,
			fs.createWriteStream(`./avatars/${data.filename}`),
		)

		// await db.update(users).set()
		return res.send({
			message: 'Updated with success',
			success: true,
		})
	})

	done()
}
