// type ApiEndpointGet<Result> = () => Promise<Result>
// type ApiEndpointPost<Body, Result> = (body: Body) => Promise<Result>

// export const api = {
// 	user: {
// 		get: useApiGet('/user'),
// 	},
// } satisfies Record<
// 	string,
// 	{ get?: ApiEndpointGet<unknown>; post?: ApiEndpointPost<unknown, unknown> }
// >
