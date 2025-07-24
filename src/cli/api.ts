import { existsSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import * as p from '@clack/prompts'
import z from 'zod/v4'
import type { RoutesGet, RoutesPost, User } from '../lib/type.js'

const HOME = process.env.HOME || ''
const SAVE_FILE = path.resolve(HOME, '.transcendance.json')

export type ApiOptions = Partial<{
	host: string
	sessionToken: string
	user: Pick<User, 'id' | 'name'>
}>

export const api = useApi()

function useApi() {
	let options: ApiOptions = {}

	async function apiGet<Route extends keyof RoutesGet>(
		route: Route,
		query: RoutesGet[Route]['query'] = null,
	): Promise<RoutesGet[Route]['res']['data']> {
		const { host, sessionToken } = options
		if (!host || !sessionToken) throw new Error('Login required')
		const url = new URL(route, host)
		if (query) {
			for (const [name, value] of Object.entries(query))
				url.searchParams.append(name, value as string)
		}
		const res = await fetch(url, {
			headers: {
				Cookie: sessionToken,
			},
		})
		if (!res.ok) await handleApiError(res)
		const json = (await res.json()) as RoutesGet[Route]['res']
		return json.data
	}

	async function apiPost<Route extends keyof RoutesPost>(
		route: Route,
		body: RoutesPost[Route]['body'],
	): Promise<RoutesPost[Route]['res']> {
		const { host, sessionToken } = options
		if (!host || !sessionToken) throw new Error('Login required')
		const url = new URL(route, host)
		const res = await fetch(url, {
			method: 'post',
			headers: {
				Cookie: sessionToken,
				'Content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		if (!res.ok) await handleApiError(res)
		const json = (await res.json()) as RoutesPost[Route]['res']
		return json
	}

	return {
		setOptions(newOptions: ApiOptions) {
			options = newOptions
		},
		user: () => options.user,
		host: () => options.host || '',
		get: apiGet,
		post: apiPost,
	}
}

export async function handleApiError(res: Response) {
	if (res.headers.get('content-type')?.startsWith('application/json')) {
		const json = await res.json()
		if (json.message) throw new Error(json.message)
	}
	throw new Error(`${res.status}: ${res.statusText}`)
}

export async function saveApiOptions(options: ApiOptions) {
	try {
		await writeFile(SAVE_FILE, JSON.stringify(options), 'utf8')
		p.log.success(`Session saved in file ${SAVE_FILE}`)
	} catch (err: unknown) {
		if (err instanceof Error) p.log.error(`${err.name}: ${err.message}`)
		return {}
	}
}

export async function deleteApiOptions() {
	try {
		await rm(SAVE_FILE, { force: true })
	} catch (err: unknown) {
		if (err instanceof Error) p.log.error(`${err.name}: ${err.message}`)
		return {}
	}
}

const apiOptionSchema = z.object({
	host: z.string(),
	sessionToken: z.string(),
	user: z.object({ id: z.number(), name: z.string() }),
})
export async function loadApiOptions() {
	try {
		if (!existsSync(SAVE_FILE)) return {}
		const content = await readFile(SAVE_FILE, 'utf8')
		const data = JSON.parse(content)
		const res = apiOptionSchema.safeParse(data)
		if (res.error) {
			p.log.error(`Session file corrupted: ${SAVE_FILE}`)
			await rm(SAVE_FILE)
			p.log.info('Session file deleted')
			api.setOptions({})
			return
		}
		p.log.success(`Session loaded from ${SAVE_FILE}`)
		api.setOptions(res.data)
	} catch (err: unknown) {
		if (err instanceof Error) p.log.error(`${err.name}: ${err.message}`)
		return
	}
}
