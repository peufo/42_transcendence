import { cubicIn, cubicOut } from '../../lib/easing.js'

type Transition = {
	start?: () => void
	step(t: number): void
	end?: () => void
}
type UseTransition = (node: HTMLElement) => Transition

export const slide: UseTransition = (node) => {
	const style = getComputedStyle(node)
	const initialHeight = Number.parseFloat(style.height)
	const initialMarginT = Number.parseFloat(style.marginTop)
	const initialMarginB = Number.parseFloat(style.marginBottom)
	const initialPaddingT = Number.parseFloat(style.paddingTop)
	const initialPaddingB = Number.parseFloat(style.paddingBottom)
	return {
		start() {
			node.style.overflow = 'hidden'
			node.style.minHeight = '0px'
		},
		step(t) {
			node.style.height = `${t * initialHeight}px`
			node.style.marginTop = `${t * initialMarginT}px`
			node.style.marginBottom = `${t * initialMarginB}px`
			node.style.paddingTop = `${t * initialPaddingT}px`
			node.style.paddingBottom = `${t * initialPaddingB}px`
		},
		end() {
			node.style.overflow = ''
			node.style.minHeight = ''
			node.style.height = ''
			node.style.marginTop = ''
			node.style.marginBottom = ''
			node.style.paddingTop = ''
			node.style.paddingBottom = ''
		},
	}
}

export async function transitionIn(
	node: HTMLElement,
	useTransition: UseTransition,
	duration = 400,
) {
	let start: number | undefined = undefined
	const transition = useTransition(node)
	return new Promise<void>((resolve) => {
		function step(timestamp: number) {
			if (start === undefined) {
				start = timestamp
				transition.start?.()
			}
			const elapsed = timestamp - start
			const t = cubicOut(elapsed / duration)
			transition.step(t)
			if (elapsed >= duration) {
				transition.end?.()
				return resolve()
			}
			requestAnimationFrame(step)
		}
		requestAnimationFrame(step)
	})
}

export function transitionOut(
	node: HTMLElement,
	useTransition: UseTransition,
	duration = 400,
) {
	let start: number | undefined = undefined
	const transition = useTransition(node)
	return new Promise<void>((resolve) => {
		function step(timestamp: number) {
			if (start === undefined) {
				start = timestamp
				transition.start?.()
			}
			const elapsed = timestamp - start
			const t = cubicIn(1 - elapsed / duration)
			transition.step(t)
			if (elapsed >= duration) {
				transition.end?.()
				return resolve()
			}
			requestAnimationFrame(step)
		}
		requestAnimationFrame(step)
	})
}
