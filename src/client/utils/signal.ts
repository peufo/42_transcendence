const effectsToSubscribe: (() => unknown)[] = []
const cleanerFactories: ((subscribes: SubscribeMap) => CleanEffect)[] = []
const cleanersStack: CleanEffect[][] = []

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
		const effectToSubscribe = effectsToSubscribe.at(-1)
		const cleanerFactory = cleanerFactories.at(-1)
		const cleaners = cleanersStack.at(-1)
		if (cleanerFactory && cleaners) {
			cleaners.push(cleanerFactory(subscribes))
		}
		if (effectToSubscribe) {
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
	cleanersStack.push([])
	cleanerFactories.push((subscribes: SubscribeMap) => {
		return () => subscribes.delete(func)
	})
	effectsToSubscribe.push(func)
	const promise = func()
	if (!promise) effectsToSubscribe.pop()
	else
		promise.then(() => {
			effectsToSubscribe.pop()
		})
	effectsToSubscribe.pop()
	cleanerFactories.pop()
	const cleaners = cleanersStack.pop() || []
	return () => {
		for (const cleaner of cleaners) {
			cleaner()
		}
	}
}
