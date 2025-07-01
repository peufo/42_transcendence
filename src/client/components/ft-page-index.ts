import { createEffect } from '../utils/signal.js'
import { getUser, getUsers, type Friend, type User } from '../utils/store.js'

customElements.define(
	'ft-page-index',
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
						<!--
						<ft-friends></ft-friends>

						<div class="flex flex-col gap-3">
							<h3 class="text-sm/6 font-semibold text-gray-900">
								Invitations
							</h3>

							<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
								<div class="flex flex-col">
									<span>Jonas</span>
									<span class="text-xs text-gray-900 leading-3">Sended at 18:12</span>
								</div>
								<div class="flex-grow"></div>
							</div>

							<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
								<div class="flex flex-col">
									<span>Léonard</span>
									<span class="text-xs text-gray-900 leading-3">Recieved at 19:32</span>
								</div>
								<div class="flex-grow"></div>
								<a href="/invitations/reject" class="btn btn-red">Reject</a>
								<a href="/invitations/accept" class="btn btn-green">Accept</a>
							</div>
						</div>
						-->

						<div class="flex flex-col gap-3">

							<form class="flex items-center w-full" data-api="users" method="get">
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
		connectedCallback() {
			this.classList.add('contents')
			createEffect(() => {
				this.innerHTML = this.render()
			})
		}
		render() {
			const users = getUsers()

			let html = ''

			for (const user of users) {
				html += /*html*/ `
					<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
						<span>${user.name}</span>
						<div class="flex-grow"></div>
						<!-- TODO: need to form method="post" -->
						<a href="/invitations/new?userId=${user.id}" class="btn btn-border">Invite</a>
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
		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3')
			// TODO: place it in createEffect() depend of friends[]
			this.innerHTML = this.renderContent()
		}

		renderContent(): string {
			const friends: Friend[] = [
				{
					id: 2,
					name: 'Bob',
					avatarPlaceholder:
						'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=0.1',
					isOnline: true,
					gameId: '12344321',
				},
				{
					id: 3,
					name: 'Alice',
					avatarPlaceholder:
						'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=0.2',
					isOnline: true,
				},
				{
					id: 4,
					name: 'Clélie',
					avatarPlaceholder:
						'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=0.3',
					isOnline: false,
				},
			]

			let html = /*html*/ `
				<h3 class="text-sm/6 font-semibold text-gray-900">
					My friends
				</h3>
			`
			for (const friend of friends) {
				const badge = friend.isOnline
					? /*html*/ `<span class="badge badge-green">Online</span>`
					: /*html*/ `<span class="badge badge-dark">Offline</span>`

				let joinBtn = ''
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
		connectedCallback() {
			createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		render(): string {
			const user = getUser()

			if (!user) {
				return /*html*/ `
					<h3 class="font-semibold text-xl text-gray-900 text-center my-8">
						Welcome
					</h3>
				`
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

function getAvatarSrc(user: User): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}
