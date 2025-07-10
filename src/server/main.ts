import path from 'node:path'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'
import { Engine } from '../lib/engine/index.js'
import { env } from './env.js'
import routes from './routes/index.js'

const server = fastify()
server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)
server.register(fastifyFormbody)
server.register(fastifyMultipart)
server.register(fastifyCookie, {
	secret: env.COOKIE_SECRET,
})

server.register(fastifyStatic, {
	root: [path.resolve('public'), path.resolve('build/public')],
	prefix: '/public',
})

if (env.dev) {
	server.register(fastifyStatic, {
		root: path.resolve('src'),
		prefix: '/src',
		decorateReply: false,
	})
}

server.register(routes)

server.get('/*', { exposeHeadRoute: false }, (req, reply) => {
	reply.sendFile('index.html')
})

server.listen({ port: env.PORT, host: env.APP_HOST }, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})

server.register(fastifyWebsocket)
server.register((fastify) => {
	fastify.get('/ws', { websocket: true }, (socket, req) => {
		const engine = new Engine({
			onEvent: (event) => socket.send(JSON.stringify(event)),
		})
		engine.start() // event ?
		socket.on('message', (message) => {
			const input = JSON.parse(message.toString('utf-8'))
			engine.setInput(input.player, input.move, input.value)
		})
		socket.on('close', (message) => {
			engine.stop()
		})
	})
})
