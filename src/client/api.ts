import { toast } from './components/ft-toast.js'
import { API_GET, type RouteApiGet } from './routes.js'
import { stringToDate } from './utils/stringToDate.js'

export const api = {
	async get(route: RouteApiGet, query?: string) {
		const setter = API_GET[route]
		const url = query ? `${route}?${query}` : route
		const res = await fetch(url)
		if (!res.ok) {
			toast.error(`Error ${res.status} in "${route}"`, res.statusText)
			return null
		}
		const json = await res.json()
		stringToDate(json.data)
		// @ts-ignore
		setter(json.data)
		return json.data
	},
}
