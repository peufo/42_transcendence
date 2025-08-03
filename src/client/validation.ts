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
	const { name, password, confirm } = data
	if (name === '' && password === '' && confirm === '')
		return 'Fill atleast one information'
	if (password !== confirm) return { confirm: 'Password is different' }
	return null
}

export const avatarUpload: ApiPostOptionValidation = (form) => {
	const formData = new FormData(form)
	const files = formData.getAll('avatarFile')
	if (files.length !== 1) return 'Please select a single file.'
	if (!(files[0] instanceof File)) {
		return 'Invalid file upload.'
	}
	const maxSize = 5 * 1024 * 1024 // TODO: put in lib ?
	if (files[0].size > maxSize)
		return `File too large, max size: ${maxSize / 1024 / 1024}MB`
	return null
}
