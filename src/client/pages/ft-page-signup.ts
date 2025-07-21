customElements.define(
	'ft-page-signup',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                            Create your account
                        </h2>
                    </div>

                    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form class="space-y-6" action="/auth/signup" method="post">
                            <div>
                                <label for="name" class="label">User name</label>
                                <div class="mt-2">
                                    <input type="text" name="name" id="name" autocomplete="off" class="input" required />
                                </div>
                            </div>

                            <div>
                                <label for="password" class="label">Password</label>
                                <div class="mt-2">
                                    <input type="password" name="password" id="password" autocomplete="new-password" class="input" required />
                                </div>
                            </div>

                            <div>
                                <label for="confirm" class="label">Confirm password</label>
                                <div class="mt-2">
                                    <input type="password" name="confirm" id="confirm" autocomplete="new-password" class="input" required />
                                </div>
                            </div>
							<div>
                                <label for="avatar" class="label">Avatar URL</label>
                                <div class="mt-2">
                                    <input type="text" name="avatar" id="avatar" autocomplete="off" class="input" value="default.png" />
                                </div>
                            </div>

                            <div class="flex flex-col items-center">
                                <button type="submit" class="btn btn-primary w-full">
                                    Sign up
                                </button>
                            </div>
                        </form>
                        <a href="/login" class="text-blue-500 text-sm hover:underline mt-4 block text-center">Already have an account?</a>
                    </div>
                </div>
            `
		}
	},
)
