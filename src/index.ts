import path from 'node:path'
import fastify from 'fastify'
import fastifyStaic from '@fastify/static'
import { env } from './env.js'

const server = fastify()

server.register(fastifyStaic, {
    root: path.resolve('public')
})

server.get('/ping', async () => {
    return 'pong sad\n'
})

server.listen({ port: env.PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

