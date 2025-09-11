import fs from 'node:fs'
import path from 'node:path'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyOauth2 from '@fastify/oauth2'
import fastifySensible from '@fastify/sensible'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'
import type { LoggerOptions } from 'pino'
import { BODY_SIZE_LIMIT } from '../lib/constants.js'
import { env } from './env.js'
import routes from './routes/index.js'

const logger: false | LoggerOptions = env.dev && {
	level: 'error',
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'HH:MM:ss Z',
			ignore: 'pid,hostname',
		},
	},
}

const googleAuthConfig = {
	authorizeHost: 'https://accounts.google.com',
	authorizePath: '/o/oauth2/v2/auth',
	tokenHost: 'https://oauth2.googleapis.com',
	tokenPath: '/token',
}

const oauth2Options = {
	name: 'googleOAuth2',
	scope: ['profile'],
	credentials: {
		client: {
			id: env.GOOGLE_CLIENT_ID,
			secret: env.GOOGLE_SECRET,
		},
		auth: googleAuthConfig,
	},
	startRedirectPath: '/auth/oauth/google',
	// TODO: use the right URI
	callbackUri: 'https://localhost:8000/auth/oauth/google/callback',
}

export const server = fastify({
	logger,
	bodyLimit: BODY_SIZE_LIMIT,
	https: {
		key: fs.readFileSync('/ssl.key'),
		cert: fs.readFileSync('/ssl.cert'),
	},
})

export function startServer() {
	server.setValidatorCompiler(validatorCompiler)
	server.setSerializerCompiler(serializerCompiler)
	server.register(fastifyWebsocket)
	server.register(fastifyFormbody)
	server.register(fastifyMultipart)
	server.register(fastifySensible)
	server.register(fastifyCookie, {
		secret: env.COOKIE_SECRET,
	})
	server.register(fastifyOauth2, oauth2Options)
	server.register(fastifyStatic, {
		root: [path.resolve('public'), path.resolve('build/public')],
		prefix: '/public',
	})

	server.register(fastifyStatic, {
		root: path.resolve(env.MEDIA_DIR),
		prefix: `/${env.MEDIA_DIR}`,
		decorateReply: false,
	})

	if (env.dev) {
		server.register(fastifyStatic, {
			root: path.resolve('src'),
			prefix: '/src',
			decorateReply: false,
		})
	}

	server.register(routes)

	server.get('/*', { exposeHeadRoute: false }, (_req, reply) => {
		reply.sendFile('index.html')
	})

	server.listen({ port: env.PORT, host: env.APP_HOST }, (err, address) => {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		console.log(`Server listening at ${address}`)
	})

	process.on('SIGUSR2', () => {
		process.kill(process.pid, 'SIGTERM')
	})

	process.on('SIGTERM', async () => {
		// await deleteOpenTournaments()
		process.exit(0)
	})
}
