import '@fastify/cookie'
import { signupService, loginService } from '../services/authService.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createSession } from './session.js'

interface SignupBody {
	username: string
	password: string
	avatar: string
}


interface LoginBody {
	username: string
	password: string
}
export async function signupUser(
	req: FastifyRequest<{ Body: SignupBody }>,
	res: FastifyReply,
) {
	const { username, password, avatar } = req.body

	try {
		const user = await signupService(username, password, avatar)

		const { token } = await createSession(user.id)

		res.setCookie('session', token, {
			path: '/',
			signed: true,
		})

		res.send({
			status: 200,
			message: 'Inscription réussie !',
			user,
		})
	} catch (err: unknown) {
		res.status(400).send({ message: 'Error while the inscription', err })
	}
}

export async function loginUser(
	req: FastifyRequest<{ Body:  LoginBody }>,
	res: FastifyReply,
) {
	const { username, password } = req.body

	try {
		const user = await loginService(username, password)
		res.send({
			status: 200,
			message: 'Connection Reussie !',
			user,
		})
	} catch (err: unknown)
	{
		res.status(410).send({ message: 'Error while trying to connect'})
	}
}
