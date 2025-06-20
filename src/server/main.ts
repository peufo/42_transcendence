import path from 'node:path'
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifyStatic from '@fastify/static'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
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
