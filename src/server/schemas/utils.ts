import type z from 'zod/v4'

export type ZodSape<T = Record<PropertyKey, unknown>> = {
	[key in keyof T]: z.ZodType<T[key]>
}
