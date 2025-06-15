import 'fastify'
import '@fastify/secure-session'

declare module '@fastify/secure-session' {
    interface SessionData {
        userId: string;
    }
}

declare module "fastify" {
    interface FastifyReply {
        locals: {
            user?: string // TODO: id, name, avatar
        };
    }
}
