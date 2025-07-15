import { exit } from 'node:process'
import * as p from '@clack/prompts'

export async function getHost(): Promise<string> {
	const host = await p.text({
		message: 'hostname ?',
		placeholder: 'http://localhost:8000',
		defaultValue: 'http://localhost:8000',
	})
	if (p.isCancel(host)) exit(0)
	return host
}

export async function getSessionCookie(host: string): Promise<string> {
	const name = await p.text({
		message: 'username ?',
		validate(value) {
			if (value.length < 3) return 'Too short'
		},
	})
	if (p.isCancel(name)) exit(0)

	const password = await p.password({
		message: 'password ?',
		validate(value) {
			if (value.length < 8) return 'Too short'
		},
	})
	if (p.isCancel(password)) exit(0)

	const s = p.spinner()
	s.start('Connection')
	try {
		const res = await fetch(`${host}/auth/login`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, password }),
		})

		if (!res.ok) {
			const json = await res.json()
			throw new Error(json.message || 'Authentification refused')
		}

		const [cookie] = res.headers.getSetCookie()
		if (!cookie) throw new Error('Cookie no setted')
		const [sessionCookie] = cookie.split(' ')
		if (!sessionCookie || !sessionCookie.startsWith('session='))
			throw new Error('cookie "session" not found')
		s.stop('Connected with success')
		return sessionCookie.slice(0, -1)
	} catch (error: unknown) {
		if (error instanceof Error) s.stop(error.message, 1)
		else s.stop('Unkown error', 1)
		exit()
	}
}
