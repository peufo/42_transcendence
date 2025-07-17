import type { ApiPostOption } from './routes.ts'

type Validation = ApiPostOption['validation']

export const validationSignup: Validation = (form) => {
	const formData = new FormData(form)
	const password = formData.get('password')
	const passwordComfirm = formData.get('confirm')
	if (password !== passwordComfirm) return { confirm: 'Password is different' }
	return null
}
