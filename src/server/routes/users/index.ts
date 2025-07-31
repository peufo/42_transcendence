import fs from 'node:fs/promises'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import sharp from 'sharp'
import { z } from 'zod/v4'
import { db, users } from '../../db/index.js'
import { env } from '../../env.js'
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
		const data = await req.file()
		if (!data) {
			return res.status(400).send({
				message: 'No file uploaded',
				sucess: false,
			})
		}
		if (!data.mimetype.startsWith('image/')) {
			return res.status(400).send({
				message: 'Only image files are allowed',
				sucess: false,
			})
		}

		const user = permission.user(res)
		const avatarPath = path.resolve(
			`./${env.MEDIA_DIR}`,
			'avatars',
			`${user.id}.webp`,
		)
		await fs.mkdir(path.resolve(`./${env.MEDIA_DIR}`, 'avatars'), {
			recursive: true,
		})
		await sharp(await data.toBuffer())
			.resize({
				width: 200,
				height: 200,
				fit: sharp.fit.cover,
				position: 'centre',
			})
			.webp()
			.toFile(avatarPath)

		await db.update(users).set({ hasAvatar: true }).where(eq(users.id, user.id))
		return res.send({
			message: 'Updated with success',
			success: true,
		})
	})

	done()
}
