import '@fastify/cookie'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { LoginSchema, SignupSchema } from '../schemas/authSchema.js'
import { loginService, signupService } from '../services/authService.js'
import { createSession } from './session.js'

export async function signupUser(
	req: FastifyRequest<{ Body: SignupSchema }>,
	res: FastifyReply,
) {
	try {
		const user = await signupService(req.body)
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
		res.status(401).send({ message: 'Error while the inscription', err })
	}
}

export async function loginUser(
	req: FastifyRequest<{ Body: LoginSchema }>,
	res: FastifyReply,
) {
	try {
		const user = await loginService(req.body)
		const { token } = await createSession(user.id)
		res.setCookie('session', token, {
			path: '/',
			signed: true,
		})
		res.send({
			status: 200,
			message: 'Connection Reussie !',
			user,
		})
	} catch (_err: unknown) {
		res.status(401).send({ message: 'Invalid name or password' })
	}
}
