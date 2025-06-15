import path from 'node:path'
import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import fastifySession, { type Session } from '@fastify/secure-session'
import handlebars from 'handlebars'
import { env } from './env.js'

declare module '@fastify/secure-session' {
    interface SessionData {
        userId: string;
    }
}

declare module "fastify" {
    interface FastifyReply {
        locals: {
            user?: string
        };
    }
}

const server = fastify()
server.register(fastifyStatic, {
    root: [
        path.resolve('build/public'),
    ]
})
server.register(fastifySession, {
    key: Buffer.from(env.SESSION_KEY, 'hex'),
    expiry: 24 * 60 * 60,
    cookie: {
        path: '/'
    }
})
server.register(fastifyView, {
    engine: {
        handlebars
    },
    root: './src/views',
    layout: 'layout.hbs',
    options: {
        useDataVariables: true,
    }
})

server.get('/', async (req, res) => {
    req.session.set('userId', 'Jonas')
    res.locals.user = req.session.get('user')
    return res.view("index", { text: "HELLO" });
})

server.listen({ port: env.PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

