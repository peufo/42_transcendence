let effectToSubscribe: (() => unknown) | null = null

type Getter<T> = () => T
type Setter<T> = (newValue: T) => void
type Updater<T> = (updater: (value: T) => T) => void

export function createSignal<T>(
	initialValue: T,
): [Getter<T>, Setter<T>, Updater<T>] {
	const subscribes = new Set<() => void>()
	let value = initialValue

	const read: Getter<T> = () => {
		if (effectToSubscribe) subscribes.add(effectToSubscribe)
		return value
	}

	const write: Setter<T> = (newValue: T) => {
		value = newValue
		for (const observer of subscribes) {
			observer()
		}
	}

	const update: Updater<T> = (updater) => {
		const newValue = updater(value)
		write(newValue)
	}

	return [read, write, update]
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
