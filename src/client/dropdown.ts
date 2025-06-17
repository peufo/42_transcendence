export function initDropdownElements() {
	const containers = document.querySelectorAll<HTMLDivElement>(
		'[data-dropdown=container]',
	)

	for (const node of containers) {
		useDropdown(node)
	}
}

function useDropdown(node: HTMLDivElement) {
	let isActive = false
	const button = node.querySelector<HTMLButtonElement>('button')
	const box = node.querySelector<HTMLDivElement>('.dropdown-box')
	if (!button || !box) {
		return
	}

	button.addEventListener('click', (event) => {
		isActive = !isActive
		console.log(isActive)
		if (isActive) {
			box.classList.add('block')
			box.classList.remove('hidden')
		} else {
			box.classList.remove('block')
			box.classList.add('hidden')
		}
	})
}
