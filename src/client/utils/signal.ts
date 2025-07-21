let effectToSubscribe: (() => unknown) | null = null
let createCleaner: ((subscribes: SubscribeMap) => CleanEffect) | null = null
let cleaners: CleanEffect[] = []

export type CleanEffect = () => void
type SubscribeMap = Set<() => void>
type Getter<T> = () => T
type Setter<T> = (newValue: T) => void
type Updater<T> = (updater: (value: T) => T) => void

export function createSignal<T>(initialValue: T): {
	get: Getter<T>
	set: Setter<T>
	update: Updater<T>
} {
	const subscribes: SubscribeMap = new Set()
	let value = initialValue

	const get: Getter<T> = () => {
		if (effectToSubscribe) {
			if (createCleaner) {
				cleaners.push(createCleaner(subscribes))
			}
			subscribes.add(effectToSubscribe)
		}
		return value
	}

	const set: Setter<T> = (newValue: T) => {
		value = newValue
		for (const observer of subscribes) {
			observer()
		}
	}

	const update: Updater<T> = (updater) => {
		const newValue = updater(value)
		set(newValue)
	}

	return { get, set, update }
}

export function createEffect(func: () => void | Promise<void>): CleanEffect {
	cleaners = []
	createCleaner = (subscribes: SubscribeMap) => {
		return () => subscribes.delete(func)
	}
	effectToSubscribe = func
	const promise = func()
	if (!promise) effectToSubscribe = null
	else
		promise.then(() => {
			effectToSubscribe = null
		})
	effectToSubscribe = null
	createCleaner = null
	const _unsubscribes = [...cleaners]
	return () => {
		for (const _unsubscribe of _unsubscribes) {
			_unsubscribe()
		}
	}
}
