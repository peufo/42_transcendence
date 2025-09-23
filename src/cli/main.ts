export type Scope<Args extends unknown[] = unknown[]> = (
	...args: Args
) => Promise<Scope | null> | (Scope | null)
export type ScopeOptions = p.SelectOptions<Scope | null>['options']

import * as p from '@clack/prompts'
import { api, loadApiOptions } from './api.js'
import { menuMain } from './menuMain.js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // unsafe but necessary for self signed

p.intro('Welcome to transcendance')
await loadApiOptions()

let scope: Scope | null = menuMain
while (scope) {
	try {
		scope = await scope()
	} catch (err: unknown) {
		if (err instanceof Error) {
			p.log.error(err.message)
			console.error(err)
		}
		if (scope === menuMain) {
			api.setOptions({})
		}
		scope = menuMain
	}
}
