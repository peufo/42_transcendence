import { useSocketChannel } from '../lib/useSocketChannels.js'
import { api } from './api.js'

export const socketChannelCLI = useSocketChannel(
	api.host(),
	// @ts-ignore Browser and Nodejs don't have the same interface
	(url) => new WebSocket(url, { headers: { Cookie: api.sessionToken() } }),
)
