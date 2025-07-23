import { exit } from 'node:process'
import * as p from '@clack/prompts'
import type { User } from '../lib/type.js'
import { api, handleApiError } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'

export const login: Scope = async () => {
	const host = await getHost()
	const options = await getSessionToken(host)
	api.setOptions({ host, ...options })
	return menuMain
}

export const logout: Scope = () => {
	api.setOptions({})
	p.log.success('Disconnected')
	return menuMain
}

async function getHost(): Promise<string> {
	const host = await p.text({
		message: 'hostname ?',
		placeholder: 'http://localhost:8000',
		defaultValue: 'http://localhost:8000',
	})
	if (p.isCancel(host)) exit(0)
	return host
}

async function getSessionToken(
	host: string,
): Promise<Partial<{ sessionToken: string; user: User }>> {
	const isSignin = await p.confirm({
		message: 'You have an account ?',
	})
	if (p.isCancel(isSignin)) exit(0)

	const name = await p.text({
		message: 'username ?',
		validate(value) {
			if (value.length < 2) return 'Too short'
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

	if (!isSignin) {
		const confirmation = await p.password({
			message: 'password confirmation',
		})
		if (p.isCancel(confirmation)) exit(0)
		if (password !== confirmation)
			throw new Error('Password and confirmation are not identical')
	}

	const s = p.spinner()
	s.start('Connection')
	try {
		const action = isSignin ? 'login' : 'signup'
		const res = await fetch(`${host}/auth/${action}`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, password }),
		})

		if (!res.ok) await handleApiError(res)

		const [cookie] = res.headers.getSetCookie()
		if (!cookie) throw new Error('Cookie no setted')
		const [sessionToken] = cookie.split(' ')
		if (!sessionToken || !sessionToken.startsWith('session='))
			throw new Error('cookie "session" not found')
		const { user } = (await res.json()) as { user: User }
		s.stop(`Hello ${user.name} 👋`)
		return { sessionToken: sessionToken.slice(0, -1), user }
	} catch (error: unknown) {
		if (error instanceof Error) s.stop(error.message, 1)
		else s.stop('Unkown error', 1)
		return {}
	}
}
