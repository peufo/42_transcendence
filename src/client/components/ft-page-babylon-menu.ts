customElements.define(
	'ft-page-babylon-menu',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
<ft-babylon-menu></ft-babylon-menu>
	    <div class="flex items-center justify-center bg-gray-100 p-7">
          <div class="flex flex-col items-center justify-start w-[400px] h-[400px] bg-gray-300 p-4 gap-6 shadow-lg rounded">
            <p class=" text-2xl font-bold text-gray-800">MENU</p>
            
            <button id="button_skybox"class="bg-green-700 text-white font-semibold px-4 py-2 rounded hover:bg-green-800">
              Skybox
            </button>

                        <button id="button_paddle"class="bg-green-700 text-white font-semibold px-4 py-2 rounded hover:bg-green-800">
                        Paddle
                        </button>
          </div>
        </div>		
`

		customElements.whenDefined('ft-babylon-menu').then(() => {

	    const ftBabylon = this.querySelector('ft-babylon-menu') as any

		interface config {
			skybox: string,
			paddle?: string, 
		}
		const skybox = ["cloud8k", "garden8k", "shanghai_16k"]
		const button = document.getElementById("button_skybox");
			let index: number = 0;
			let length = skybox.length; 
			button?.addEventListener("click", (e) {
				console.log("click")
				index += 1;
				if (index == length)
					index = 0
				ftBabylon.handleSkyboxUpdate(skybox[index])
			})
		
		})
		}

	},

)

