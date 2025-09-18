import argon2 from 'argon2'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { getUserActiveTournament } from '../tournaments/tournamentDb.js'
import { deleteSession, setSessionCookie } from './controller.js'
import { createUser, createUserOAuth2, getAuthUser } from './model.js'
import { loginSchema, signupSchema } from './schema.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/user', getSchema('/auth/user', null), async (_req, res) => {
		const user = res.locals?.user
		if (!user) return res.send({ data: undefined })
		const tournament = await getUserActiveTournament(user.id)
		return res.send({ data: { ...user, tournament } })
	})

	server.post(
		'/login',
		postSchema('/auth/login', loginSchema),
		async (req, res) => {
			const { name, password } = req.body
			const authUser = await getAuthUser(name)
			if (!authUser)
				return res.forbidden('body/password Wrong username or password')
			if (authUser.isOAuth2 === true || !authUser.passwordHash)
				return res.forbidden('This user uses a google account to authenticate')
			const passwordOk = await argon2.verify(authUser.passwordHash, password)
			if (!passwordOk)
				return res.forbidden('body/password Wrong username or password')
			await setSessionCookie(authUser.id, res)
			const { passwordHash, ...user } = authUser
			res.send({ message: 'Connection success !', user })
		},
	)

	server.post(
		'/signup',
		postSchema('/auth/signup', signupSchema),
		async (req, res) => {
			const authUser = await getAuthUser(req.body.name)
			if (authUser) return res.forbidden('body/name User already exists.')
			const user = await createUser(req.body)
			await setSessionCookie(user.id, res)
			res.send({ message: 'Signup success !', user })
		},
	)

	server.post(
		'/logout',
		postSchema('/auth/logout', null),
		async (_req, res) => {
			const session = permission.session(res)
			await deleteSession(session.id)
			const now = new Date()
			res.setCookie('session', '', { path: '/', expires: now })
			res.send({ success: true })
		},
	)

	server.get('/oauth/google/callback', async (req, res) => {
		const { token } =
			//@ts-ignore
			await server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
		const userRes = await fetch(
			'https://www.googleapis.com/oauth2/v2/userinfo',
			{
				headers: { Authorization: `Bearer ${token.access_token}` },
			},
		)
		const googleUser = await userRes.json()
		const name = googleUser.name.substring(
			0,
			Math.min(googleUser.name.length, 24),
		)
		let authUser = await getAuthUser(name)
		if (authUser) {
			if (!authUser.isOAuth2)
				return res.forbidden(
					`A user with this name already exist and doesn't use a google account to authenticate`,
				)
		} else {
			authUser = await createUserOAuth2(name)
		}
		await setSessionCookie(authUser.id, res)
		const { passwordHash, ...user } = authUser
		res.redirect('/me').send({ message: 'Connection success !', user })
	})

	done()
}
