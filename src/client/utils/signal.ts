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
// TODO: const effect is necessarry only func call conditional getters
export function createEffect(func: () => void | Promise<void>) {
	const effect = async () => {
		effectToSubscribe = effect
		await func()
		effectToSubscribe = null
	}
	effect()
}
