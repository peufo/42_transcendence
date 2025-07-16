customElements.define(
	'ft-page-login',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
					<div class="sm:mx-auto sm:w-full sm:max-w-sm">
						<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Welcome in the game</h2>
					</div>

					<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
						<form method="post" action="/auth/login" class="space-y-6">
							<div>
								<label for="name" class="label">User name</label>
								<div class="mt-2">
									<input type="text" name="name" id="name" autocomplete="off" class="input" />
								</div>
							</div>

							<div>
								<label for="password" class="label">Password</label>
								<div class="mt-2">
									<input type="password" name="password" id="password" autocomplete="current-password" class="input">
								</div>
							</div>
							<div class="flex flex-col items-center">
								<button type="submit" class="btn btn-primary w-full ">
									Sign in
								</button>
							</div>
						</form>
					</div>
				</div>
			`
		}
	},
)
