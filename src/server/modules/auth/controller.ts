import '@fastify/cookie'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { LoginSchema, SignupSchema } from './authSchema.js'
import { loginService, signupService } from './service.js'
import { createSession } from './session.js'

export async function signupUser(
	req: FastifyRequest<{ Body: SignupSchema }>,
	res: FastifyReply,
) {
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
}

export async function loginUser(
	req: FastifyRequest<{ Body: LoginSchema }>,
	res: FastifyReply,
) {
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
}
