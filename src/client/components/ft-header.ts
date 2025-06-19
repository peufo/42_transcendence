import { jsonParse } from '../utils/jsonParse.js'

type DataHeader = {
	user: Partial<{
		name: string
	}> | null
}

customElements.define(
	'ft-header',
	class extends HTMLElement {
		static observedAttributes = ['data']
		private data: DataHeader = { user: {} }

		attributeChangedCallback(name: string, oldValue: string, newValue: string) {
			if (name === 'data') {
				console.log({ name, oldValue, newValue })
				this.data = jsonParse<DataHeader>(newValue, { user: {} })
				this.innerHTML = this.render()
			}
		}

		connectedCallback() {
			console.log('Connected callback')
		}

		// TODO: How to pass user in ft-user-menu ? store ?
		// TODO: How to build better if else statement

		render = () =>
			/*html*/ `
            <header class="flex items-center p-2 pl-4 gap-2 border-b border-indigo-100">
                <a href="/" class="text-2xl text-blue-600">Transcendance</a>
                <div class="flex-grow"></div>${
									this.data.user
										? '<ft-user-menu></ft-user-menu>'
										: /*html*/ `
                                    <a href="/login" class="btn btn-border flex shrink-0 flex-nowrap">
                                        <i data-lucide="user"></i>
                                        <span>Login</span>
                                    </a>`
								}
                    

            </header>
        `
	},
)

customElements.define(
	'ft-user-menu',
	class extends HTMLDivElement {
		constructor() {
			super()
			this.innerHTML = this.render()
		}

		render = () => /*html*/ `
            <div class="relative" data-dropdown="container">
                <button class="btn btn-border flex shrink-0 flex-nowrap">
                    <i data-lucide="user"></i>
                    <span>{{ @root.user.name }}</span>
                </button>
                <div class="dropdown-box hidden absolute w-36 right-0 rounded-md my-1" role="menu"
                    aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                    <a href="/" class="menu-item" role="menuitem" tabindex="-1">
                        <i data-lucide="home" class="h-5"></i>
                        Home
                    </a>
                    <a href="/stats" class="menu-item" role="menuitem" tabindex="-1">
                        <i data-lucide="chart-spline" class="h-5"></i>
                        History
                    </a>
                    <form method="post" action="/auth/logout">
                        <button type="submit" class="menu-item w-full" role="menuitem" tabindex="-1">
                            <i data-lucide="log-out" class="h-5"></i>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        `
	},
)
