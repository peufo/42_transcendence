import z from 'zod/v4'
import type { RoutesGet, RoutesPost } from '../lib/type.js'

export function postSchema<
	R extends keyof RoutesPost,
	BodyShape extends z.ZodRawShape,
>(_url: R, bodyShape: BodyShape) {
	return {
		schema: {
			body: z.object(bodyShape),
			response: {
				200: z.custom<RoutesPost[R]>((data) => data),
			},
		},
	}
}

export function getSchema<
	R extends keyof RoutesGet,
	QueryShape extends z.ZodRawShape,
>(_url: R, queryShape?: QueryShape) {
	return {
		schema: {
			querystring: z.object(queryShape),
			response: {
				200: z.custom<{ data: RoutesGet[R] }>((data) => data),
			},
		},
	}
}

export type ZodShape<T = Record<PropertyKey, unknown>> = {
	[key in keyof T]: z.ZodType<T[key]>
}

export type ZodData<Schema extends z.ZodRawShape, Data = unknown> = Data &
	z.infer<z.ZodObject<Schema>>
