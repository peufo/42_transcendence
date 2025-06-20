type Subscriber<T> = (value: T) => void

class Signal<T> {
	private _value: T
	private subscribers: Subscriber<T>[]
	constructor(value: T) {
		this._value = value
		this.subscribers = []
	}
	get value() {
		return this._value
	}
	set value(value: T) {
		this._value = value
		this.emit()
	}
	emit() {
		this.subscribers.forEach((sub) => sub(this.value))
	}
	subscribe(subscriber: Subscriber<T>) {
		this.subscribers.push(subscriber)
	}
}

let effectFunction: (() => void) | null = null

export function createSignal<T>(value: T): [() => T, (value: T) => void] {
	const signal = new Signal(value)
	return [
		function getValue() {
			if (effectFunction) signal.subscribe(effectFunction)
			return signal.value
		},
		function setValue(value: T) {
			return (signal.value = value)
		},
	]
}

export function createEffect(func: () => void) {
	effectFunction = func
	func()
	effectFunction = null
}
