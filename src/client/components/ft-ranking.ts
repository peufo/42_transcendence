import { getAvatarSrc } from '../utils/avatar.js'
import { createEffect } from '../utils/signal.js'
import { $rankedUsers, $user } from '../utils/store.js'

customElements.define(
	'ft-ranking',
	class extends HTMLElement {
		private user = $user.get()

		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3', 'card', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			if (!this.user) return ''
			let html = /*html*/ `<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Ranking</h2>`
			let rank = 1
			let nameColor = ''
			let user_in_top = false
			const usersRanked = $rankedUsers.get()
			html += /*html*/ `<div class="flex flex-col w-full gap-2">
			 <div class="flex font-semibold text-center">
				<div class="w-1/6 p-2">Rank</div>
				<div class="w-1/6 p-2">Avatar</div>
				<div class="w-2/6 p-2">Name</div>
				<div class="w-2/6 p-2"># Goals</div>
			</div>
			`
			for (const userRanked of usersRanked) {
				if (rank >= 6) {
					if (userRanked.id === this.user.id && rank === 6) {
						html += /*html*/ `
							<div class="flex items-center text-center p-2 border-indigo-500 border-2 rounded-xl">
								<div class="w-1/6 flex flex-row justify-center items-center">
									<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>
								</div>
								<div class="w-1/6 flex justify-center items-center">
									<img src="${getAvatarSrc(this.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
								</div>
								<div class="w-2/6 flex justify-center items-center font-bold">${this.user.name}</div>
								<div class="w-2/6 flex justify-center items-center">${this.user.numberOfGoals}</div>
							</div>
						</div>
						`
						return html
					}
					if (userRanked.id === this.user.id) break
					else {
						rank++
						continue
					}
				}
				const isCurrentUser = userRanked.id === this.user.id
				if (isCurrentUser) {
					nameColor = `font-bold`
					user_in_top = true
				} else {
					nameColor = ''
				}

				html += /*html*/ `
				<div class="flex items-center text-center p-2 card ${isCurrentUser ? 'border-indigo-500 border-2' : 'border-gray-200'}">
					<div class="w-1/6 flex flex-row justify-center items-center">
						`
				switch (rank) {
					case 1:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-yellow-500 stroke-black-400"></ft-icon>`
						break
					case 2:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-zinc-500 stroke-black-400"></ft-icon>`
						break
					case 3:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-amber-800 stroke-black-400"></ft-icon>`
						break
					default:
						html += /*html*/ `<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>`
						break
				}
				html += /*html*/ `
				</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(userRanked)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center ${nameColor}">${userRanked.name}</div>
					<div class="w-2/6 flex justify-center items-center">${userRanked.numberOfGoals}</div>
				</div>`
				rank++
			}
			if (!user_in_top) {
				html += /*html*/ `
				<div class="flex items-center justify-center p-2 rounded-xl font-bold">...</div>
				<div class="flex items-center text-center p-2 border-indigo-500 border-2 rounded-xl">
					<div class="w-1/6 flex flex-row justify-center items-center">
						<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>
					</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(this.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center font-bold">${this.user.name}</div>
					<div class="w-2/6 flex justify-center items-center">${this.user.numberOfGoals}</div>
				</div>
				`
			}
			html += `</div>`
			return html
		}
	},
)
