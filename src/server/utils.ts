import z from 'zod/v4'
// import type { RoutesPost } from '../lib/type.js'

// export function routePost<
// 	R extends keyof RoutesPost,
// 	Shape extends z.ZodRawShape,
// 	Response = RoutesPost[R],
// >(url: R, shape: Shape) {
// 	return {
// 		schema: {
// 			body: z.object(shape),
// 			response: {
// 				200: {} as z.ZodCustom<Response>,
// 			},
// 		},
// 	}
// }

export function schemaBody<Shape extends z.ZodRawShape>(shape: Shape) {
	return {
		schema: {
			body: z.object(shape),
		},
	}
}

export type ZodShape<T = Record<PropertyKey, unknown>> = {
	[key in keyof T]: z.ZodType<T[key]>
}

// type ZodRawShape = {
// 	readonly [x: string]: z.core.$ZodType<
// 		unknown,
// 		unknown,
// 		z.core.$ZodTypeInternals<unknown, unknown>
// 	>
// }
