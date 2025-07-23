customElements.define(
  'ft-page-login',
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = /*html*/ `
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-200 via-blue-200 to-blue-900
">
          <div class="relative flex flex-col justify-center shadow-lg rounded-2xl bg-blue-900
                      px-6 py-10 sm:px-8 md:px-12 lg:px-16
                      w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px]
                      min-h-[500px]">

            <!-- Image Podium -->
            <div class="absolute top-4 right-4 w-44 h-44 sm:w-32 sm:h-32 lg:w-56 lg:h-56">
              <img src="/public/images/podium.png" alt="3D Icon"
                   class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>

            <!-- Image Balle -->
            <div class="absolute top-4 left-2 w-50 h-50 sm:w-28 sm:h-28 lg:w-46 lg:h-46 bg-blue-900/60 rounded-xl backdrop-blur-md p-2 shadow-inner z-0">
              <img src="/public/images/ball.png" alt="3D Icon"
                   class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>

            <!-- Image Paddle -->
            <div class="absolute bottom-4 right-6 w-20 h-20 sm:w-28 sm:h-28 lg:w-46 lg:h-46 bg-blue-900/60 rounded-xl backdrop-blur-md p-2 shadow-inner z-0">
              <img src="/public/images/paddle.png" alt="3D Icon"
                   class="w-full h-full object-contain mix-blend-lighten opacity-90" />
            </div>

            <!-- Titre -->
            <div class="sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <h2 class="mt-10 text-center text-3xl sm:text-4xl font-mono tracking-tight text-white">
                Welcome to the Pong!
              </h2>
            </div>

            <!-- Formulaire -->
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm z-10">
              <form method="post" action="/auth/login" class="space-y-6 text-base sm:text-lg md:text-xl">
                <div>
                  <label for="name" class="block text-white font-medium">User name</label>
                  <div class="mt-2">
                    <input type="text" name="name" id="name" autocomplete="off"
                      class="input w-full rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 " />
                  </div>
                </div>

                <div>
                  <label for="password" class="block text-white font-medium">Password</label>
                  <div class="mt-2">
                    <input type="password" name="password" id="password" autocomplete="current-password"
                      class="input w-full rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur placeholder-white/60 focus:outline-none" />
                  </div>
                </div>

                <div class="flex flex-col items-center">
                  <button type="submit"
                    class="btn btn-primary w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                    Sign in
                  </button>
                </div>
              </form>

              <a href="/signup" class="text-blue-400 text-sm hover:underline mt-4 block text-center">Create an account</a>
            </div>

          </div>
        </div>
      `;
    }
  }
);

