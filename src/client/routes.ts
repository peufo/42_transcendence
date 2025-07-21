import { setFriendships, setMatches, setUser, setUsers } from './utils/store.js'
import { validationSignup } from './validation.js'

export type RouteApiGet = keyof typeof API_GET
export type RouteApiPost = keyof typeof API_POST
export type RoutePage = keyof typeof PAGES

export type ApiPostOption = {
	validation?: (form: HTMLFormElement) => null | Record<string, string>
	onSuccess?<Result>(data: Result): void
	redirectTo?: () => RoutePage
	invalidate?: RouteApiGet[]
}

export type PageOption = {
	component: string
	pageData?: RouteApiGet[]
	layoutData?: RouteApiGet[]
	isPublic?: boolean | 'only'
}

export const API_GET = {
	'/auth/user': setUser,
	'/users': setUsers,
	'/friendships': setFriendships,
	'/userstats': setMatches,
} as const

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
	'/friendships/new': { invalidate: ['/friendships'] },
	'/friendships/accept': { invalidate: ['/friendships'] },
	'/friendships/delete': { invalidate: ['/friendships'] },
} satisfies Record<string, ApiPostOption>

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
	'/tournament/play': { component: 'ft-page-tournament-play' },
	'/local/play/babylon': { component: 'ft-page-local-play-babylon' },
} as const satisfies Record<string, PageOption>

function redirectAfterLogin() {
	const searchParams = new URLSearchParams(document.location.search)
	const redirectTo = searchParams.get('redirectTo') as RoutePage | null
	return redirectTo || '/me'
}
