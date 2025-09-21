import { defineComponent } from '../utils/component.js'
import { slide, transitionIn, transitionOut } from '../utils/transition.js'

defineComponent('ft-page-login', () => {
	return {
		onLoad(element) {
			let action: 'login' | 'signup' = 'login'
			const buttonChangeAction = document.createElement('button')
			buttonChangeAction.type = 'button'
			buttonChangeAction.classList.add(
				'w-full',
				'cursor-pointer',
				'hover:underline',
			)
			const elForm = element.querySelector('form')
			const elSubmit = element.querySelector('button[type=submit]')
			const elInputPassword =
				element.querySelector<HTMLInputElement>('#password')
			const elInputContainerConfirm = element.querySelector<HTMLDivElement>(
				'#inputContainerConfirm',
			)
			const inputAvatarContainer = element.querySelector<HTMLDivElement>(
				'#inputAvatarContainer',
			)
			if (
				!elForm ||
				!elSubmit ||
				!elInputPassword ||
				!elInputContainerConfirm ||
				!inputAvatarContainer
			) {
				throw new Error('Html structure of component is not correct !')
			}

			const inputContainerConfirm = document.createElement('div')
			inputContainerConfirm.innerHTML = /*html*/ `
          <label for="confirm" class="font-medium text-black text-sm">Password</label>
          <div class="mt-2">
            <input type="password" name="confirm" id="confirm" autocomplete="new-password" class="input" />
          </div>
      `

			const changeAction = () => {
				action = action === 'login' ? 'signup' : 'login'
				renderAction()
			}

			const renderAction = () => {
				buttonChangeAction.innerText =
					action === 'login' ? 'Create an account' : 'Already have an account ?'
				elForm.action = `/auth/${action}`
				elSubmit.innerHTML = `Sign ${action === 'login' ? 'in' : 'up'}`
				elInputPassword.autocomplete =
					action === 'login' ? 'current-password' : 'new-password'

				if (action === 'login') {
					transitionOut(elInputContainerConfirm, slide, 250).then(() => {
						elInputContainerConfirm.classList.add('hidden')
					})
					transitionOut(inputAvatarContainer, slide, 250).then(() => {
						inputAvatarContainer.classList.add('hidden')
					})
				} else {
					elInputContainerConfirm.classList.remove('hidden')
					transitionIn(elInputContainerConfirm, slide, 250)
					inputAvatarContainer.classList.remove('hidden')
					transitionIn(inputAvatarContainer, slide, 250)
				}
			}
			renderAction()

			buttonChangeAction.addEventListener('click', changeAction)
			element
				.querySelector('#actionBtnContainer')
				?.appendChild(buttonChangeAction)
			return () => {
				buttonChangeAction.removeEventListener('click', changeAction)
			}
		},

		render() {
			return /*html*/ `
			<div class="max-w-md mx-auto p-4 mt-6">
				<ft-title></ft-title>
				<div class="lex flex-col justify-center shadow-lg rounded-2xl
							border-2 border-indigo-600/25
							py-2 px-6 sm:px-8 md:px-12 lg:px-16 backdrop-blur-md bg-white/25">
					<!-- Formulaire -->
					<form method="post" class="my-6 text-base sm:text-lg md:text-xl">
					<div id="inputAvatarContainer" class="mt-2 hidden">
						<ft-avatar-selector></ft-avatar-selector>
					</div>

					<div class="mt-2">
						<label for="name" class="font-medium text-black text-sm">User name</label>
						<div class="mt-2">
						<input autofocus type="text" name="name" id="name" autocomplete="off" class="input" />
						</div>
					</div>

					<div class="mt-2">
						<label for="password" class="font-medium text-black text-sm">Password</label>
						<div class="mt-2">
						<input type="password" name="password" id="password" class="input"/>
						</div>
					</div>

					<div id="inputContainerConfirm" class="mt-2 hidden">
						<label for="confirm" class="font-medium text-black text-sm">Confirm password</label>
						<div class="mt-2">
						<input type="password" name="confirm" id="confirm" autocomplete="new-password" class="input" />
						</div>
					</div>

					<div class="flex flex-row-reverse gap-6 flex-wrap mt-10">
						<button type="submit" class="btn btn-primary shrink-0 grow"></button>
						<a href="/login/waiting/google" class="btn btn-border shrink-0 grow">
						<div>Login with</div>
						<div class="flex flex-row justify-around">
							<span class="text-blue-500">G</span>
							<span class="text-red-500">o</span>
							<span class="text-yellow-500">o</span>
							<span class="text-blue-500">g</span>
							<span class="text-green-500">l</span>
							<span class="text-red-500">e</span>
						</div>
						</a>
					</div>
					</form>

					<div id="actionBtnContainer" class="text-center text-indigo-600 text-sm"></div>
					<h3 class="mt-4 text-sm text-center tracking-tight text-black/60">
					A 42 school project by aloubry, jvoisard and lbaecher
					</h3>  
				</div>
			</div>
			`
		},
	}
})
