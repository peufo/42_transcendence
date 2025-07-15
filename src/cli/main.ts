import { exit } from 'node:process'
import * as p from '@clack/prompts'
import { start } from './game.js'

// import { useApi } from './api.js'
// import { getHost, getSessionCookie } from './login.js'

p.intro('Welcome to transcendance')
// const host = await getHost()
// const sessionCookie = await getSessionCookie(host)
// const api = useApi(host, sessionCookie)
mainMenu()

async function mainMenu() {
	const action = await p.select({
		message: 'What you want to do ?',
		options: [
			// { value: listFriends, label: 'List friends' },
			{ value: start, label: 'Start game' },
			{ value: exit, label: 'Give up' },
		],
	})
	if (p.isCancel(action)) exit()
	action()
}

// async function listFriends() {
// 	const friends = await api.friends()
// 	if (!friends.length) {
// 		p.log.warn('Sorry, You have no Friends !')
// 	} else {
// 		p.note(
// 			friends
// 				.map((f) => `${f.name.padEnd(16)}${f.isActive ? '[online]' : ''}`)
// 				.join('\n'),
// 			'My friends',
// 		)
// 	}
// 	mainMenu()
// }
