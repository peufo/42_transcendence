import type { UserBasic } from '../../lib/type.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import {
	getFriends,
	getInvitations,
	getUser,
	getUsers,
} from '../utils/store.js'

customElements.define(
	'ft-page-me',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="flex min-h-full flex-col justify-center p-6 lg:px-8">
                    <div class="flex flex-col gap-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <div>
                            <ft-welcome></ft-welcome>

                            <div class="grid grid-cols-2 gap-2">
                                <a href="/local/new" class="btn btn-primary">
                                    <ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
                                    Local game
                                </a>
                                <a href="/game/new" class="btn btn-primary">
                                    <ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
                                    New tournament
                                </a>
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
			const users = getUsers()

			if (!users)
				return 'no users can be found that are not already your friends!'

			let html = ''

			for (const user of users) {
				html += /*html*/ `
                    <div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
                        <img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <span>${user.name}</span>
                        <div class="flex-grow"></div>
                        <form method="post" action="/invitations/new" class="btn btn-border">
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
			const friends = getFriends()
			if (!friends) return 'you have no friends :('

			let html = /*html*/ `
                <h3 class="text-sm/6 font-semibold text-gray-900">
                    My friends
                </h3>
            `
			for (const friend of friends) {
				const badge = friend.isActive
					? /*html*/ `<span class="badge badge-green">Online</span>`
					: /*html*/ `<span class="badge badge-dark">Offline</span>`

				let joinBtn = ''
				const removeBtn = /*html*/ `
                <form method="post" action="/invitations/remove">
                        <input type="hidden" name="friendId" value="${friend.id}">
                        <input class="btn btn-red" type="submit" value="Remove">
                    </form>`
				if (friend.gameId) {
					joinBtn = /*html*/ `<a href="/game/play?gameId=${friend.gameId}" class="btn btn-border">Join</a>`
				}

				html += /*html*/ `
                    <div class="flex p-2 items-center gap-2 border border-gray-200 rounded-xl">
                        <img src="${getAvatarSrc(friend)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <span>${friend.name}</span>
                        ${badge}
                        <div class="flex-grow"></div>
                        ${joinBtn}
                        ${removeBtn}
                    </div>
                `
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
			const user = getUser()
			const invitations = getInvitations()
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
                    <form method="post" action="/invitations/${action}">
                        <input type="hidden" name="friendshipId" value="${invitation.id}">
                        <input class="btn ${color}" type="submit" value="${label}">
                    </form>
                `

				const createdByMe = invitation.createdBy === user.id
				const otherUser =
					invitation.user1Id === user.id ? invitation.user2 : invitation.user1
				const buttons: string[] = []
				if (createdByMe) {
					buttons.push(formButton('cancel', 'Cancel', 'btn-red'))
				} else {
					buttons.push(formButton('accept', 'Accept', 'btn-green'))
					buttons.push(formButton('reject', 'Reject', 'btn-red'))
				}

				html += /*html*/ `
                    <div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
                    <img src="${getAvatarSrc(otherUser)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <div class="flex flex-col">
                            <span>${otherUser.name}</span>
                            <span class="text-xs text-gray-900 leading-3">
                                ${createdByMe ? 'Sent' : 'Received'} a ${formater.format(new Date(invitation.createdAt))}
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
			const user = getUser()
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
                    <a href="/stats" class="btn btn-border" title="Ratio">
                        <ft-icon name="star" class="h-4 w-4 mr-1"></ft-icon>
                        <span>0.65</span>
                        <span class="badge badge-dark translate-x-2">6 / 9</span>
                    </a>
                </div>
            `
		}
	},
)

function getAvatarSrc(user: UserBasic): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}
