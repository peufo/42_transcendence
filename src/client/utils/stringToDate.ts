const dateKeys = ['createdAt', 'lastLogin', 'finishedAt']

export function stringToDate(data: unknown) {
	if (typeof data === 'object') {
		for (const key in data) {
			const k = key as keyof typeof data
			if (typeof data[k] === 'string') {
				if (dateKeys.includes(k)) (data[k] as Date) = new Date(data[k])
			} else {
				stringToDate(data[k])
			}
		}
	}
}
