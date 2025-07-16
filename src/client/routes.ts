import { toast } from './components/ft-toast.js'
import {
	setFriends,
	setInvitations,
	setMatches,
	setUser,
	setUsers,
} from './utils/store.js'

export type RouteApiGet = keyof typeof API_GET
export type RouteApiPost = keyof typeof API_POST
export type RoutePage = keyof typeof PAGES

export type ApiPostOption = {
	onSuccess?<Result>(data: Result): void
	redirect?: RoutePage
	invalidate?: RouteApiGet[]
}

// TODO: add auth: boolean
export type PageOption = {
	component: string
	pageData?: RouteApiGet[]
	layoutData?: RouteApiGet[]
}

export const API_GET = {
	'/auth/user': setUser,
	'/users': setUsers,
	'/users/friends': setFriends,
	'/invitations': setInvitations,
	'/userstats': setMatches,
} as const

export const API_POST = {
	'/auth/login': {
		onSuccess: () => toast.success('Hey, bienvenue'),
		redirect: '/',
	},
	'/auth/logout': {
		onSuccess: () => toast.info('Bye'),
		redirect: '/',
	},
	'/invitations/new': { invalidate: ['/invitations'] },
	'/invitations/remove': { invalidate: ['/users/friends'] },
	'/invitations/accept': { invalidate: ['/invitations', '/users/friends'] },
	'/invitations/cancel': { invalidate: ['/invitations'] },
	'/invitations/reject': { invalidate: ['/invitations'] },
} satisfies Record<string, ApiPostOption>

export const PAGES = {
	'/': {
		component: 'ft-page-index',
		layoutData: ['/auth/user'],
		pageData: ['/users/friends', '/invitations'],
	},
	'/login': { component: 'ft-page-login' },
	'/stats': { component: 'ft-page-stats', pageData: ['/userstats'] },
	'/account': { component: 'ft-page-account' },
	'/local/new': { component: 'ft-page-local-new' },
	'/local/play': { component: 'ft-page-local-play' },
	'/game/new': { component: 'ft-page-game-new' },
	'/game/play': { component: 'ft-page-game-play' },
	'/local/play/babylon': { component: 'ft-page-local-play-babylon' },
} as const satisfies Record<string, PageOption>
