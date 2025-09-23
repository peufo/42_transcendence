import { defineComponent } from '../utils/component.js'

defineComponent('ft-page-downloads', () => {
	return {
		onLoad(element) {
			element.addEventListener('click', (e) => {
				e.stopPropagation()
			})
		},
		render() {
			return /*html*/ `
			<div class="flex flex-col p-4 mt-6 justify-center items-center">
				<ft-title>Download CLI</ft-title>
				<div class="flex flex-col justify-evenly items-center card p-5 gap-5 mt-10">
					<div class="flex flex-row justify-evenly items-center gap-5">
						<a download class="dl-btn btn btn-border card w-[150px] h-[150px] flex flex-col" href="/public/cli-linux-x64">
							<ft-icon name="linux"></ft-icon>
							<div class="text-black">Linux X64</div>
						</a>
						<a download class="dl-btn btn btn-border card w-[150px] h-[150px] flex flex-col" href="/public/cli-windows-x64.exe">
							<ft-icon name="windows"></ft-icon>
							<div class="text-black">Windows X64</div>
						</a>
						<a download class="dl-btn btn btn-border card w-[150px] h-[150px] flex flex-col" href="/public/cli-mac-arm64">
							<ft-icon name="apple"></ft-icon>
							<div class="text-black">Mac ARM64</div>
						</a>
						<a download class="dl-btn btn btn-border card w-[150px] h-[150px] flex flex-col" href="/public/cli-mac-x64">
							<ft-icon name="apple"></ft-icon>
							<div class="text-black">Mac X64</div>
						</a>
					</div>
				</div>
			</div>
			`
		},
	}
})
