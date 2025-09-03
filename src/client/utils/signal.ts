type Signal<T> = {
	get: Getter<T>
	set: Setter<T>
	update: Updater<T>
}
const effectsToSubscribe: { effect: () => void; scopes: symbol[] }[] = []
const cleanerFactories: ((subscribes: SubscribeMap) => CleanEffect)[] = []
const cleanersStack: CleanEffect[][] = []
const scopes: symbol[] = []

export type CleanEffect = () => void
type SubscribeMap = Set<() => void>
type Getter<T> = () => T
type Setter<T> = (newValue: T) => void
type Updater<T> = (updater: (value: T) => T) => void

export function createSignal<T>(initialValue: T): Signal<T> {
	const subscribes: SubscribeMap = new Set()
	let value = initialValue
	const scope = Symbol('Representation of a signal scope')

	const get: Getter<T> = () => {
		const cleanerFactory = cleanerFactories.at(-1)
		const cleaners = cleanersStack.at(-1)
		if (cleanerFactory && cleaners) {
			cleaners.push(cleanerFactory(subscribes))
		}
		const effectToSubscribe = effectsToSubscribe.at(-1)
		if (!effectToSubscribe) {
			return value
		}
		const { effect, scopes } = effectToSubscribe
		const parentEffect = effectsToSubscribe
			.slice(0, -1)
			.find(({ scopes: _scopes }) => _scopes.includes(scope))
		if (!parentEffect) {
			scopes.push(scope)
			subscribes.add(effect)
		}
		return value
	}

	const set: Setter<T> = (newValue: T) => {
		value = newValue
		for (const effect of subscribes) {
			effect()
		}
	}

	const update: Updater<T> = (updater) => {
		const newValue = updater(value)
		set(newValue)
	}

	scopes.push(scope)
	return { get, set, update }
}

export function createEffect(func: () => void | Promise<void>): CleanEffect {
	cleanersStack.push([])
	cleanerFactories.push((subscribes: SubscribeMap) => () => {
		subscribes.delete(func)
	})
	effectsToSubscribe.push({ effect: func, scopes: [] })
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
