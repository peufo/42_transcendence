import fastifyView from '@fastify/view';
import handlebars from 'handlebars'
import { FastifyPluginCallback } from 'fastify'
import '../types.js'

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
        res.locals.user = 'Alice' // TODO: handle with auth hook
        return res.view('index');
    })
    server.get('/stats', async (req, res) => {
        res.locals.user = 'Alice' // TODO: handle with auth hook
        return res.view('stats');
    })

    // Local games
    server.get('/local/new', async (req, res) => {
        return res.view('local/new');
    })
    server.get<{ Querystring: { playerA: string, playerB: string, bot: string } }>('/local/play', (req, res) => {
        // TODO: check if query is correct
        // https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation
        return res.view('local/play', req.query)
    })

    // Online games
    server.get('/game/new', async (req, res) => {
        return res.view('game/new');
    })
    server.get<{ Params: { gameId: string } }>('/game/play/:gameId', (req, res) => {
        // TODO: check if user can join this game
        const { gameId } = req.params
        return res.view('game/play', { gameId })
    })

    done()
}

export default views