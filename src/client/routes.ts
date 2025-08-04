import type { RoutesGet, RoutesPost } from '../lib/type.js'
import * as store from './utils/store.js'
import {
	avatarUpload,
	validationSignup,
	validationUpdate,
} from './validation.js'

export type RouteApiGet = keyof typeof API_GET
export type RouteApiPost = keyof typeof API_POST
export type RoutePage = keyof typeof PAGES

export type ApiPostOptionValidation = (
	formData: FormData,
) => null | Record<string, string> | string

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
	[Route in keyof RoutesGet]: (
		newValue: RoutesGet[Route]['res']['data'],
	) => void
} = {
	'/auth/user': store.$user.set,
	'/users': store.$users.set,
	'/friendships/friend': store.$friendshipsFriend.set,
	'/friendships/invitation': store.$friendshipsInvitation.set,
	'/userstats': store.$matches.set,
	'/tournaments': store.$tournament.set,
	'/allusersstats': store.$rankedUsers.set,
}

export const API_POST: {
	[Route in keyof RoutesPost]: ApiPostOption<RoutesPost[Route]['res']>
} = {
	'/auth/login': {
		redirectTo: redirectAfterLogin,
	},
	'/auth/signup': {
		redirectTo: redirectAfterLogin,
		validation: validationSignup,
	},
	'/users/update': {
		redirectTo: () => '/account',
		validation: validationUpdate,
	},
	'/users/update/avatar': {
		redirectTo: () => '/account',
		validation: avatarUpload,
	},
	'/auth/logout': {
		redirectTo: () => '/',
	},
	'/friendships/new': {
		invalidate: ['/friendships/invitation'],
		onSuccess({ invitedUserId }) {
			store.$users.update((users) =>
				users.filter((user) => user.id !== invitedUserId),
			)
		},
	},
	'/friendships/accept': {
		invalidate: ['/friendships/friend', '/friendships/invitation'],
	},
	'/friendships/delete': {
		invalidate: ['/friendships/friend', '/friendships/invitation'],
	},
	'/tournaments/new': {
		redirectTo: ({ tournamentId }) =>
			`/tournament/play?tournamentId=${tournamentId}`,
	},
	'/tournaments/delete': {
		redirectTo: () => '/me',
	},
	'/tournaments/join': {
		redirectTo: ({ tournamentId }) =>
			`/tournament/play?tournamentId=${tournamentId}`,
	},
	'/tournaments/quit': {
		redirectTo: () => '/me',
	},
}

export const PAGES = {
	'/': {
		component: 'ft-page-index',
		layoutData: ['/auth/user'],
		isPublic: 'only',
	},
	'/me': {
		component: 'ft-page-me',
		pageData: ['/friendships/friend', '/friendships/invitation'],
	},
	'/login': { component: 'ft-page-login', isPublic: 'only' },
	'/signup': { component: 'ft-page-signup', isPublic: 'only' },
	'/stats': {
		component: 'ft-page-stats',
		pageData: ['/userstats', '/allusersstats'],
	},
	'/account': { component: 'ft-page-account' },
	'/local/new': { component: 'ft-page-local-new', isPublic: true },
	'/local/play': { component: 'ft-page-local-play', isPublic: true },
	'/tournament/new': { component: 'ft-page-tournament-new' },
	'/tournament/play': {
		component: 'ft-page-tournament-play',
		pageData: ['/tournaments'],
	},
	'/local/play/babylon': {
		component: 'ft-page-local-play-babylon',
		isPublic: true,
	},
} as const satisfies Record<string, PageOption>

function redirectAfterLogin() {
	const searchParams = new URLSearchParams(document.location.search)
	const redirectTo = searchParams.get('redirectTo') as RoutePage | null
	return redirectTo || '/me'
}
