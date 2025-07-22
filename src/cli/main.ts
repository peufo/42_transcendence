import * as p from '@clack/prompts'

import { menuMain } from './menuMain.js'

export type Scope = () => Promise<Scope | null> | (Scope | null)
export type ScopeOptions = p.SelectOptions<Scope | null>['options']

p.intro('Welcome to transcendance')

let scope: Scope | null = menuMain
while (scope) {
	try {
		scope = await scope()
	} catch (err: unknown) {
		if (err instanceof Error) p.log.error(err.message)
		scope = menuMain
	}
}
