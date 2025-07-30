customElements.define(
	'ft-page-signup',
	class extends HTMLElement {
		connectedCallback() {
			let seed = 0
			this.innerHTML = /*html*/ `
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-200 via-blue-200 to-blue-900">
          <div class="relative flex flex-col justify-center shadow-lg rounded-2xl bg-blue-900 px-6 py-10 sm:px-8 md:px-12 lg:px-16 w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] min-h-[500px]">

            <!-- Images décoratives -->
            <div class="absolute top-4 right-4 w-44 h-44 sm:w-32 sm:h-32 lg:w-56 lg:h-56">
              <img src="/public/images/podium.png" alt="3D Icon" class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>
            <div class="absolute top-4 left-2 w-50 h-50 sm:w-28 sm:h-28 lg:w-46 lg:h-46 bg-blue-900/60 rounded-xl backdrop-blur-md p-2 shadow-inner z-0">
              <img src="/public/images/ball.png" alt="3D Icon" class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>
            <div class="absolute bottom-4 right-6 w-20 h-20 sm:w-28 sm:h-28 lg:w-46 lg:h-46 bg-blue-900/60 rounded-xl backdrop-blur-md p-2 shadow-inner z-0">
              <img src="/public/images/paddle.png" alt="3D Icon" class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>

            <!-- Titre -->
            <div class="sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <h2 class="mt-10 text-center text-3xl sm:text-4xl font-mono tracking-tight text-white">
                Create your account
              </h2>
            </div>

                    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                        <form class="space-y-6" action="/auth/signup" method="post">
                            <div class="flex flex-col items-center space-y-4">
                                <div class ="w-32 h-32">
									<img id="avatarPlaceholderImage" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
									<input type="hidden" name="avatarPlaceholder" id="avatarPlaceholderInput" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
								</div>
                                <div class="flex gap-2">
                                    <button type="button" id="prev" class="btn btn-primary">
                                        <ft-icon name="arrow-left" class="fill-transparent h-5"></ft-icon>  
                                    </button>
                                    <button type="button" id="next" class="btn btn-primary">
                                        <ft-icon name="arrow-right" class="fill-transparent h-5"></ft-icon> 
                                    </button>
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
                  <button type="submit" class="btn btn-primary w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                    Sign up
                  </button>
                </div>
              </form>

              <a href="/login" class="text-blue-400 text-sm hover:underline mt-4 block text-center">Already have an account?</a>
            </div>

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
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
				this.querySelector('#prev')?.addEventListener('click', () => {
					seed--
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
			}
		}
	},
)
