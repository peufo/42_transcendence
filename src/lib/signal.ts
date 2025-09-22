export type Signal<T> = {
	get: Getter<T>
	set: Setter<T>
	update: Updater<T>
}
type Effect = {
	parent?: Effect
	func: () => void | Promise<void>
	signals: Set<symbol>
}
const stackEffects: Effect[] = []
const cleanerFactories: ((subscribes: SubscribeMap) => CleanEffect)[] = []
const cleanersStack: CleanEffect[][] = []

export type CleanEffect = () => void
type SubscribeMap = Set<Effect>
type Getter<T> = (subscribe?: boolean) => T
type Setter<T> = (newValue: T) => void
type Updater<T> = (updater: (value: T) => T) => void

export function createSignal<T>(initialValue: T): Signal<T> {
	const subscribes: SubscribeMap = new Set()
	let value = initialValue
	const signal = Symbol('Signal symbol')

	const get: Getter<T> = (subscribe = true) => {
		if (!subscribe) {
			return value
		}
		const cleanerFactory = cleanerFactories.at(-1)
		const cleaners = cleanersStack.at(-1)
		if (cleanerFactory && cleaners) {
			cleaners.push(cleanerFactory(subscribes))
		}
		const effect = stackEffects.at(-1)
		if (!effect) {
			return value
		}
		let parentEffect = effect.parent
		while (parentEffect) {
			if (parentEffect.signals.has(signal)) {
				return value
			}
			parentEffect = parentEffect.parent
		}
		effect.signals.add(signal)
		subscribes.add(effect)
		return value
	}

	const set: Setter<T> = (newValue: T) => {
		value = newValue
		for (const effect of subscribes) {
			stackEffects.push(effect)
			effect.func()
			stackEffects.pop()
		}
	}

	const update: Updater<T> = (updater) => {
		const newValue = updater(value)
		set(newValue)
	}
	return { get, set, update }
}

export function createEffect(func: () => void): CleanEffect {
	cleanersStack.push([])
	const effect: Effect = {
		func,
		parent: stackEffects.at(-1),
		signals: new Set(),
	}
	cleanerFactories.push((subscribes: SubscribeMap) => () => {
		subscribes.delete(effect)
	})
	stackEffects.push(effect)
	func()
	stackEffects.pop()
	cleanerFactories.pop()
	const cleaners = cleanersStack.pop() || []
	return () => {
		for (const cleaner of cleaners) {
			cleaner()
		}
	}
}
