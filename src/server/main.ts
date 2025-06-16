import path from 'node:path'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
import { env } from './env.js'
import routes from './routes/index.js'

const server = fastify()
server.register(fastifyStatic, {
	root: [path.resolve('build/public')],
})

server.register(routes)

server.listen({ port: env.PORT }, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})
