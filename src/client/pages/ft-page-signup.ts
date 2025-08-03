customElements.define(
	'ft-page-signup',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-blue-200 to-c-900">
          <div class="relative flex flex-col justify-center shadow-lg rounded-2xl bg-blue-900 px-6 py-10 sm:px-8 md:px-12 lg:px-16 w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] min-h-[500px]">

            <!-- Titre -->
            <div class="sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <h2 class="mt-10 text-center text-3xl sm:text-4xl font-mono tracking-tight text-white">
                Create your account
              </h2>
            </div>

                    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                        <form class="space-y-6" action="/auth/signup" method="post">
                            <div class="flex flex-col items-center space-y-4">
                                <ft-avatar-selector></ft-avatar-selector>
                                
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
                  <button type="submit" class="btn btn-primary w-full py-2 from-violet-600 to-indigo-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                    Sign up
                  </button>
                </div>
              </form>

              <a href="/login" class="text-blue-400 text-sm hover:underline mt-4 block text-center">Already have an account?</a>
            </div>

          </div>
        </div>
      `
		}
	},
)
