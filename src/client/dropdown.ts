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
	let timeoutId: NodeJS.Timeout | null = null
	const button = node.querySelector<HTMLButtonElement>('button')
	const box = node.querySelector<HTMLDivElement>('.dropdown-box')
	if (!button || !box) {
		return
	}

	function setActive(value: boolean) {
		isActive = value
		if (!box) return
		if (isActive) {
			box.classList.add('block')
			box.classList.remove('hidden')
		} else {
			box.classList.remove('block')
			box.classList.add('hidden')
		}
	}

	button.addEventListener('click', () => {
		setActive(!isActive)
	})

	node.addEventListener('mouseenter', () => {
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
	})

	node.addEventListener('mouseleave', () => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => setActive(false), 500)
	})
}
