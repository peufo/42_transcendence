import type { ApiPostOptionValidation } from './routes.js'

export const validationSignup: ApiPostOptionValidation = (form) => {
	const formData = new FormData(form)
	const password = formData.get('password')
	const passwordConfirm = formData.get('confirm')
	if (password !== passwordConfirm) return { confirm: 'Password is different' }
	return null
}
