import { useSocketChannel } from '../lib/useSocketChannels.js'

export const socketChannel = useSocketChannel(document.location.origin)
