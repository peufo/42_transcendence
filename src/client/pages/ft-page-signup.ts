customElements.define(
	'ft-page-signup',
	class extends HTMLElement {
		connectedCallback() {
			let seed = 0
			this.innerHTML = /*html*/ `
                <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                            Create your account
                        </h2>
                    </div>

                    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                        <form class="space-y-6" action="/auth/signup" method="post">
                            <div class="flex flex-col items-center space-y-4">
                                <div class ="w-32 h-32">
									<img id="avatarPlaceholderImage" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
									<input type="hidden" name="avatarPlaceholder" id="avatarPlaceholderInput" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
                                	<div class="badge badge-red w-max my-1" style="">Invalid input: expected string</div> 
									<!-- TODO: fit error and remove the line above -->
								</div>
                                <div class= flex space-x-6>
                                <button type ="button" id="prev" class="px-4 py-2 btn-primary"> ⬅️ </button>
                                <button type ="button" id="next" class="px-4 py-2 btn-primary"> ➡️ </button>
                                </div>
								<!-- TODO: add file upload -->
							<!-- <div>
                                <div class="mt-2">
                                <label class="block mb-2 text-sm font-medium text-gray-900" for="file_input">Upload file</label>
                                <input type="file" accept="image/*" class="btn btn-primary w-full" name="avatarFile" id="file_input">
                                </div>
                            </div> -->
                            </div>
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

			const avatarPlaceholderImage = this.querySelector<HTMLImageElement>(
				'#avatarPlaceholderImage',
			)
			const avatarPlaceholderInput = this.querySelector<HTMLInputElement>(
				'#avatarPlaceholderInput',
			)
			if (avatarPlaceholderImage && avatarPlaceholderInput) {
				this.querySelector('#next')?.addEventListener('click', () => {
					seed++
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
					avatarPlaceholderInput.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
				})
				this.querySelector('#prev')?.addEventListener('click', () => {
					seed--
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
					avatarPlaceholderInput.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
				})
			}
		}
	},
)
