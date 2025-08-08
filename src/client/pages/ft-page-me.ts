import type { FriendshipFriend } from '../../lib/type.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import {
	$friendshipsFriend,
	$friendshipsInvitation,
	$user,
	$users,
} from '../utils/store.js'

customElements.define(
	'ft-page-me',
	class extends HTMLElement {
		connectedCallback() {
			const user = $user.get()

			let activeTournamentButton = ''
			if (user?.tournament)
				activeTournamentButton = /*html*/ `
				<a href="/tournament/play?tournamentId=${user.tournament.id}" class="btn btn-primary col-span-2">
					<ft-icon name="rotate-cw" class="h-5 w-5 mr-1"></ft-icon>
					Return to tournament
				</a>`

			this.innerHTML = /*html*/ `
                <div class="flex min-h-full flex-col justify-center p-6 lg:px-8">
                    <div class="flex flex-col gap-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <div>
                            <ft-welcome></ft-welcome>

                            <div class="grid grid-cols-2 gap-3">
                                <a href="/local/new" class="btn btn-primary">
                                    <ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
                                    Local game
                                </a>
                                <a href="/tournament/new" class="btn btn-primary">
                                    <ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
                                    New tournament
                                </a>
								${activeTournamentButton}
                            </div>
                        </div>
                       <ft-friends></ft-friends>
                    <ft-invitations></ft-invitations>
                    <div class="flex flex-col gap-3">
                        <form method="get" action="/users" class="flex items-center w-full">
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <ft-icon name="user-search" class="h-5 w-5 text-gray-500"></ft-icon>
                                </div>
                                <input type="text"
                                    name="search"
                                    autocomplete="off"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 "
                                    placeholder="Looking for new friends" />
                            </div>
                        </form>
                        <ft-users></ft-users>
                    </div>
                    </div>
                </div>
            `
		}
	},
)

customElements.define(
	'ft-users',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.classList.add('contents')
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render() {
			const users = $users.get()
			if (!users || !users.length)
				return 'no users can be found that are not already your friends!'

			let html = ''

			for (const user of users) {
				html += /*html*/ `
                    <div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
                        <img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <span>${user.name}</span>
                        <div class="flex-grow"></div>
                        <form method="post" action="/friendships/new" class="btn btn-border">
                            <input type="hidden" name="invitedUserId" value="${user.id}" />
                            <input type="submit" value="Invite" />
                        </form>

                    </div>
                `
			}
			return html
		}
	},
)

customElements.define(
	'ft-friends',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3')
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		renderContent(): string {
			const friendships = $friendshipsFriend.get()

			if (!friendships) return 'you have no friends :('

			let html = /*html*/ `
                <h3 class="text-sm/6 font-semibold text-gray-900">
                    My friends
                </h3>
            `
			function renderFriendship(friendship: FriendshipFriend): string {
				const { withUser: friend } = friendship

				const removeBtn = /*html*/ `
                	<form method="post" action="/friendships/delete">
						<input type="hidden" name="friendshipId" value="${friendship.id}" />
                        <input class="btn btn-red" type="submit" value="Remove" />
                    </form>`

				let joinButtons = ''
				if (friend.tournament?.state === 'open') {
					joinButtons = /*html*/ `
					<form method="post" action="/tournaments/join">
                        <input type="hidden" name="tournamentId" value="${friend.tournament.id}">
                        <input class="btn btn-border" type="submit" value="Join">
                    </form>`
				}
				if (friend.tournament?.state === 'ongoing') {
					joinButtons = /*html*/ `
                    <div class="badge badge-indigo">In a tournament</div>`
				}

				return /*html*/ `
                    <div class="flex p-2 items-center gap-2 border border-gray-200 rounded-xl">
						<div class="relative h-8 w-8">
							<div
								class="
									absolute w-2 h-2 rounded-full -bottom-1 -right-1 border
									${friend.isActive ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-400'}
									
								"
								title="${friend.name} is ${friend.isActive ? 'online' : 'offline'}"
							></div>
							<img src="${getAvatarSrc(friend)}" alt="Avatar de l'utilisateur" class="rounded">
						</div>
                        <span>${friend.name}</span>
						${joinButtons}
                        <div class="flex-grow"></div>
                        ${removeBtn}
                    </div>
                `
			}

			const friendshipsOn = friendships.filter((f) => f.withUser.isActive)
			const friendshipsOff = friendships.filter((f) => !f.withUser.isActive)
			for (const friendship of friendshipsOn) {
				html += renderFriendship(friendship)
			}
			for (const friendship of friendshipsOff) {
				html += renderFriendship(friendship)
			}

			return html
		}
	},
)

customElements.define(
	'ft-invitations',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3')
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			const user = $user.get()

			const invitations = $friendshipsInvitation.get()
			if (!user || !invitations.length) return ''

			let html = /*html*/ `
                <h3 class="text-sm/6 font-semibold text-gray-900">
                    Invitations
                </h3>`

			const formater = new Intl.DateTimeFormat('fr-CH', {
				dateStyle: 'short',
			})

			for (const invitation of invitations) {
				const formButton = (
					action: string,
					label: string,
					color: string,
				) => /*html*/ `
                    <form method="post" action="/friendships/${action}">
                        <input type="hidden" name="friendshipId" value="${invitation.id}">
                        <input class="btn ${color}" type="submit" value="${label}">
                    </form>
                `
				const createdByMe = invitation.createdBy === user.id

				const buttons: string[] = []
				if (createdByMe) {
					buttons.push(formButton('delete', 'Cancel', 'btn-red'))
				} else {
					buttons.push(formButton('accept', 'Accept', 'btn-green'))
					buttons.push(formButton('delete', 'Reject', 'btn-red'))
				}

				html += /*html*/ `
                    <div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
                    <img src="${getAvatarSrc(invitation.withUser)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <div class="flex flex-col">
                            <span>${invitation.withUser.name}</span>
                            <span class="text-xs text-gray-900 leading-3">
                                ${createdByMe ? 'Sent' : 'Received'} a ${formater.format(invitation.createdAt)}
                            </span>
                        </div>
                        <div class="flex-grow"></div>
                        ${buttons.join('')}
                    </div>
                `
			}
			return html
		}
	},
)

customElements.define(
	'ft-welcome',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			const user = $user.get()
			if (!user) {
				return /*html*/ `<span>401 not authorized </span>`
			}

			return /*html*/ `
                <div class="py-8 flex items-center gap-2">
                    <img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-12 w-12 rounded">
                    <h3 class="font-semibold text-xl text-gray-900 ">
                        ${user.name}
                    </h3>

                    <div class="flex-grow"></div>
                    <a href="/stats" class="btn btn-border">
                        <ft-icon name="ranking" class="mr-1"></ft-icon>
                        <span>Statistics</span>
                    </a>
                </div>
            `
		}
	},
)
