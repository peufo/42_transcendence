import fastifyView from '@fastify/view';
import handlebars from 'handlebars'
import { FastifyPluginCallback } from 'fastify'

const views: FastifyPluginCallback = (server, options, done) => {

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
        res.locals.user = 'Alice'
        return res.view("index");
    })
    server.get('/login', async (req, res) => {
        res.locals.user = 'Alice'
        return res.view("login");
    })
    done()
}

export default views