import path from 'node:path'
import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import handlebars from 'handlebars'
import { env } from './env.js'

const server = fastify()
server.register(fastifyStatic, {
    root: [
        path.resolve('public'),
        path.resolve('build/public'),
    ]
})

server.register(fastifyView, {
    engine: {
        handlebars
    },
    root: './src/server/templates'
})

server.get('/layout', async (req, res) => {
    return res.view("layout.hbs", { text: "HELLO" });
})

server.listen({ port: env.PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

