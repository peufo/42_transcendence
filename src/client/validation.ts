import { BODY_SIZE_LIMIT } from '../lib/constants.js'
import type { ApiPostOptionValidation } from './routes.js'

export const validationSignup: ApiPostOptionValidation = (formData) => {
	const password = formData.get('password')
	const passwordConfirm = formData.get('confirm')
	if (password !== passwordConfirm) return { confirm: 'Password is different' }
	return null
}

export const validationUpdate: ApiPostOptionValidation = (formData) => {
	const data = Object.fromEntries(formData.entries())
	const { name, password, confirm } = data
	if (name === '' && password === '' && confirm === '')
		return 'Fill atleast one information'
	if (password !== confirm) return { confirm: 'Password is different' }
	return null
}

export const avatarUpload: ApiPostOptionValidation = (formData) => {
	const files = formData.getAll('avatarFile')
	if (files.length !== 1) return 'Please select a single file.'
	if (!(files[0] instanceof File)) {
		return 'Invalid file upload.'
	}
	if (files[0].size > BODY_SIZE_LIMIT)
		return `File too large, max size: ${BODY_SIZE_LIMIT / 1024 / 1024}MB`
	return null
}
