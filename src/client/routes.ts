import type { RoutesGet, RoutesPost } from '../lib/type.js'
import * as store from './utils/store.js'
import { validationSignup } from './validation.js'

export type RouteApiGet = keyof typeof API_GET
export type RouteApiPost = keyof typeof API_POST
export type RoutePage = keyof typeof PAGES

export type ApiPostOptionValidation = (
	form: HTMLFormElement,
) => null | Record<string, string>

export type ApiPostOption<Result> = {
	validation?: ApiPostOptionValidation
	onSuccess?(data: Result): void
	redirectTo?(data: Result): RoutePage | `${RoutePage}?${string}`
	invalidate?: RouteApiGet[]
}

export type PageOption = {
	component: string
	pageData?: RouteApiGet[]
	layoutData?: RouteApiGet[]
	isPublic?: boolean | 'only'
}

export const API_GET: {
	[Route in keyof RoutesGet]: (newValue: RoutesGet[Route]) => void
} = {
	'/auth/user': store.$user.set,
	'/users': store.$users.set,
	'/friendships': store.$friendships.set,
	'/userstats': store.$matches.set,
	'/tournaments': store.$tournament.set,
}

export const API_POST = {
	'/auth/login': {
		redirectTo: redirectAfterLogin,
	},
	'/auth/signup': {
		redirectTo: redirectAfterLogin,
		validation: validationSignup,
	},
	'/auth/logout': {
		redirectTo: () => '/',
	},
	'/tournaments/new': {
		redirectTo: ({ tournamentId }) => `/tournament/play?id=${tournamentId}`,
	},
	'/friendships/new': { invalidate: ['/friendships'] },
	'/friendships/accept': { invalidate: ['/friendships'] },
	'/friendships/delete': { invalidate: ['/friendships'] },
} satisfies {
	[Route in keyof RoutesPost]: ApiPostOption<RoutesPost[Route]>
}

export const PAGES = {
	'/': {
		component: 'ft-page-index',
		layoutData: ['/auth/user'],
		isPublic: 'only',
	},
	'/me': {
		component: 'ft-page-me',
		pageData: ['/friendships'],
	},
	'/login': { component: 'ft-page-login', isPublic: 'only' },
	'/signup': { component: 'ft-page-signup', isPublic: 'only' },
	'/stats': { component: 'ft-page-stats', pageData: ['/userstats'] },
	'/account': { component: 'ft-page-account' },
	'/local/new': { component: 'ft-page-local-new', isPublic: true },
	'/local/play': { component: 'ft-page-local-play', isPublic: true },
	'/tournament/new': { component: 'ft-page-tournament-new' },
	'/tournament/play': {
		component: 'ft-page-tournament-play',
		pageData: ['/tournaments'],
	},
	'/local/play/babylon': { component: 'ft-page-local-play-babylon' },
	'/signup': {component: 'ft-page-signup', isPublic: true},
} as const satisfies Record<string, PageOption>

function redirectAfterLogin() {
	const searchParams = new URLSearchParams(document.location.search)
	const redirectTo = searchParams.get('redirectTo') as RoutePage | null
	return redirectTo || '/me'
}
