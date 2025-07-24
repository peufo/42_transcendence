customElements.define(
	'ft-page-account',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
						Update your information
						</h2>
                    </div>

                    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form class="space-y-6" action="/users/update" method="post">
						<div class="border-2 border-blue-300 p-4 rounded-md">
                            <div>
                                <label for="name" class="label">New username</label>
                                <div class="mt-2">
                                    <input type="text" name="name" id="name" autocomplete="off" class="input" />
                                </div>
                            </div>
						</div>

						<div class="border-2 border-blue-300 p-4 rounded-md">
                            <div>
                                <label for="password" class="label">New password</label>
                                <div class="mt-2">
                                    <input type="password" name="password" id="password" autocomplete="new-password" class="input"  />
                                </div>
                            </div>
                            <div>
                                <label for="confirm" class="label">Confirm new password</label>
                                <div class="mt-2">
                                    <input type="password" name="confirm" id="confirm" autocomplete="new-password" class="input" />
                                </div>
                            </div>
						</div>

						<div class="border-2 border-blue-300 p-4 rounded-md">
							<div>
                                <label for="avatar" class="label">Avatar URL</label>
                                <div class="mt-2">
                                    <input type="text" name="avatar" id="avatar" autocomplete="off" class="input"/>
                                </div>
                            </div>
						</div>

                            <div class="flex flex-col items-center">
                                <button type="submit" class="btn btn-primary w-full">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `
		}
	},
)
