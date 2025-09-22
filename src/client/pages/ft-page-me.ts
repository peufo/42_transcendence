import type { FriendshipFriend } from '../../lib/type.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { defineComponent } from '../utils/component.js'
import {
	$friendshipsFriend,
	$friendshipsInvitation,
	$user,
	$users,
} from '../utils/store.js'

defineComponent('ft-page-me', () => ({
	render: () => /*html*/ `
		<div class="flex min-h-full flex-col justify-center p-6 lg:px-8">
			<div class="flex flex-col gap-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<div>
					<ft-welcome></ft-welcome>
					<ft-game-selection></ft-game-selection>
				</div>
				<ft-friends></ft-friends>
			<ft-invitations></ft-invitations>
			<div class="flex flex-col gap-3">
				<form method="get" action="/users" class="flex items-center w-full">
					<div class="relative w-full">
						<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
							<ft-icon name="user-search" class="h-5 w-5 text-gray-500"></ft-icon>
						</div>
						<input type="search"
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
	`,
}))

defineComponent('ft-users', () => ({
	onLoad(element) {
		element.classList.add('contents')
	},
	render() {
		const users = $users.get()
		if (!users || !users.length) return ''
		// let html = /*html*/ `
		// 	<div class="text-center">Wow! You are so popular that all users are already your friends!</div>
		// `
		let html = ''
		for (const user of users) {
			html += /*html*/ `
				<div class="flex p-2 items-center gap-2 card rounded-xl">
					<img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					<span class="break-all">${user.name}</span>
					<div class="flex-grow"></div>
					<form method="post" action="/friendships/new" class="btn btn-border">
						<input type="hidden" name="invitedUserId" value="${user.id}" />
						<input type="submit" value="Invite" />
					</form>

				</div>
			`
		}
		return html
	},
}))

defineComponent('ft-friends', () => ({
	onLoad(element) {
		element.classList.add('flex', 'flex-col', 'gap-3')
	},
	render() {
		const friendships = $friendshipsFriend.get()

		if (!friendships) return 'you have no friends :('

		let html = /*html*/ `
			<h3 class="text-sm/6 font-semibold text-gray-900">
				My friends
			</h3>
		`
		const renderFriendship = (friendship: FriendshipFriend): string => {
			const { withUser: friend } = friendship

			const removeBtn = /*html*/ `
				<form method="post" action="/friendships/delete">
					<input type="hidden" name="friendshipId" value="${friendship.id}" />
					<button class="border-red-400 btn btn-red w-9 px-2!">
						<ft-icon name="cancel" class="stroke-red-800"></ft-icon>
					</button>
				</form>`

			let joinButtons = ''

			if (friend.tournament?.state === 'open') {
				joinButtons = /*html*/ `
					<a class="btn btn-border" href="/tournament/play?tournamentId=${friend.tournament.id}">
                        Join
					</a>`
			}
			if (friend.tournament?.state === 'ongoing') {
				joinButtons = /*html*/ `
                    <div class="badge badge-indigo">In a tournament</div>`
			}

			return /*html*/ `
                    <div class="flex p-2 items-center gap-2 card">
						<div class="relative h-8 w-8 shrink-0">
							<div
								class="
									absolute w-2 h-2 rounded-full -bottom-1 -right-1 border
									${friend.isActive ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-400'}

								"
								title="${friend.name} is ${friend.isActive ? 'online' : 'offline'}"
							></div>
							<img src="${getAvatarSrc(friend)}" alt="Avatar de l'utilisateur" class="rounded">
						</div>
                        <span class="break-all">${friend.name}</span>
						<div class="flex-grow"></div>
						${joinButtons}
                        ${removeBtn}
                    </div>
                `
		}

		if (!friendships.length) {
			html += /*html*/ `
					<div class="text-gray-600 grid place-content-center p-4 card">
						You have no friends :(
					</div>
				`
			return html
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
	},
}))

defineComponent('ft-invitations', () => ({
	onLoad(element) {
		element.classList.add('flex', 'flex-col', 'gap-3')
	},
	render() {
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
				<div class="flex p-2 items-center gap-2 card">
				<img src="${getAvatarSrc(invitation.withUser)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					<div class="flex flex-col">
						<span class="break-all">${invitation.withUser.name}</span>
						<span class="text-xs text-gray-900 leading-3">
							${createdByMe ? 'Sent' : 'Received'} at ${formater.format(invitation.createdAt)}
						</span>
					</div>
					<div class="flex-grow"></div>
					${buttons.join('')}
				</div>
			`
		}
		return html
	},
}))

customElements.define(
	'ft-welcome',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = this.render()
		}

		render(): string {
			const user = $user.get()
			if (!user) {
				return /*html*/ `<span>401 not authorized </span>`
			}

			return /*html*/ `
                <div class="py-8 flex items-center gap-2">
                    <img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-12 w-12 rounded">
                    <h3 class="font-semibold text-xl text-gray-900 break-all">
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
