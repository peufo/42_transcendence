let effectToSubscribe: (() => unknown) | null = null

export function createSignal<T>(
	initialValue: T,
): [() => T, (newValue: T) => void] {
	const subscribes = new Set<() => void>()
	let value = initialValue

	const read = () => {
		if (effectToSubscribe) subscribes.add(effectToSubscribe)
		return value
	}

	const write = (newValue: T) => {
		value = newValue
		for (const observer of subscribes) {
			observer()
		}
	}

	return [read, write]
}

// TODO: return unsunbscriber ?
export function createEffect(func: () => void) {
	const effect = () => {
		effectToSubscribe = effect
		func()
		effectToSubscribe = null
	}
	effect()
}

export function subscribe<T>(func: () => T): T {
	const effect = () => {
		effectToSubscribe = effect
		const result = func()
		effectToSubscribe = null
		return result
	}
	return effect()
}
