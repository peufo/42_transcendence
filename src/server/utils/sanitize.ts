export function sanitize(str: string): string {
	return str.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;')
}
