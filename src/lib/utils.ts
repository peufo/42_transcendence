export function getRandomArbitrary(min: number, max: number): number {
	return Math.random() * (max - min) + min
}

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[]
}

export function deserialize(data: unknown) {
	const dateKeys = ['createdAt', 'lastLogin', 'finishedAt']
	if (typeof data === 'object') {
		for (const key in data) {
			const k = key as keyof typeof data
			if (typeof data[k] === 'string') {
				if (dateKeys.includes(k)) (data[k] as Date) = new Date(data[k])
				else (data[k] as string) = sanitize(data[k])
			} else {
				deserialize(data[k])
			}
		}
	}
}

function sanitize(str: string): string {
	// TODO: Sanitize str
	return str
}
