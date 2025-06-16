import path from 'node:path'
import fastifySession from '@fastify/secure-session'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
import { env } from './env.js'
import routes from './routes/index.js'

const server = fastify()
server.register(fastifyStatic, {
	root: [path.resolve('build/public')],
})
server.register(fastifySession, {
	key: Buffer.from(env.SESSION_KEY, 'hex'),
	expiry: 24 * 60 * 60,
	cookie: {
		path: '/',
	},
})

server.register(routes)

server.listen({ port: env.PORT }, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})
