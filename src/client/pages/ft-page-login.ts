customElements.define(
	'ft-page-login',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
        <div class="flex items-center justify-center min-h-screen">
          <!-- <div class="w-screen h-screen">
              <video class="w-[100%] h-[100%]" autoplay muted loop>
                <source src="/public/video/output.mp4" type="video/mp4" width="1024" height="768">
                Your browser doesn't support the video tag.
          </div> -->
          <div class="relative flex flex-col justify-center shadow-lg rounded-2xl border-2 border-indigo-600
                      px-6 py-10 sm:px-8 md:px-12 lg:px-16
                      w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px]
                      min-h-[500px]">
                      
            <!-- Titre -->
            <div class="sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <h2 class="mt-10 text-center text-3xl sm:text-4xl tracking-tight text-indigo-600">
                Welcome to the Pong
              </h2>
            </div>

            <!-- Formulaire -->
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <form method="post" action="/auth/login" class="space-y-6 text-base sm:text-lg md:text-xl">
                <div>
                  <label for="name" class="font-medium text-black">User name</label>
                  <div class="mt-2">
                    <input autofocus type="text" name="name" id="name" autocomplete="off"
                      class="input w-full rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 " />
                  </div>
                </div>

                <div>
                  <label for="password" class="font-medium text-black">Password</label>
                  <div class="mt-2">
                    <input type="password" name="password" id="password" autocomplete="current-password"
                     class="input w-full rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 "/>
                  </div>
                </div>
                <div class="flex flex-col items-center">
                  <button type="submit"
                    class="btn btn-primary w-full py-2 mb-3 from-violet-600 to-indigo-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer">
                    Sign in
                  </button>
                </div>
              </form>
              <a href="/login/waiting/google">
                <div class="btn btn-secondary rounded-lg transition-all cursor-pointer">
                  <div>Login with</div>
                    <div class="flex flex-row justify-around">
                    <div class="text-blue-500">G</div>
                    <div class="text-red-500">o</div>
                    <div class="text-yellow-500">o</div>
                    <div class="text-blue-500">g</div>
                    <div class="text-green-500">l</div>
                    <div class="text-red-500">e</div>
                  </div>
                </div>
                  </a>
                  <a href="/signup" class="text-blue-400 text-sm hover:underline mt-4 block text-center">Create an account</a>
                </div>
                <h3 class="mt-4 text-center tracking-tight text-black text-gray-400">
                    A 42 school project by aloubry, jvoisard, alletond and lbaecher
                </h3>
              </div>
            </div>
          </div>
        </div>
      `
		}
	},
)
