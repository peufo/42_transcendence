import type { ApiPostOptionValidation } from './routes.js'

export const validationSignup: ApiPostOptionValidation = (form) => {
	const formData = new FormData(form)
	const password = formData.get('password')
	const passwordConfirm = formData.get('confirm')
	if (password !== passwordConfirm) return { confirm: 'Password is different' }
	return null
}

export const validationUpdate: ApiPostOptionValidation = (form) => {
	const formData = new FormData(form)
	const data = Object.fromEntries(formData.entries())
	const { name, password, confirm, avatar } = data
	if (name === '' && password === '' && confirm === '' && avatar === '')
		return { name: 'Fill atleast one information', confirm: '' }
	if (password !== confirm)
		return { name: '', confirm: 'Password is different' }
	return null
}
