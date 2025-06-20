export function jsonParse<Type>(
	text: string | null | undefined,
	defaultValue: Type,
): Type {
	try {
		if (!text) {
			return defaultValue
		}
		return JSON.parse(text)
	} catch {
		return defaultValue
	}
}

export function jsonParseOrThrow<Type>(text: string | null | undefined): Type {
	if (!text) {
		throw new Error('Try to parse missing text')
	}
	return JSON.parse(text)
}
