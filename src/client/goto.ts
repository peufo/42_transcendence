export function goto(url: URL | string) {
	window.history.pushState({}, '', url)
	document.location.replace(url)
}
