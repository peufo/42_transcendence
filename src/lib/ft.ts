type Component = ComponentNode | ComponentText
type Props = Record<string, unknown>

type ComponentNode<P = Props> = {
	type: keyof HTMLElementTagNameMap
	props: P & {
		children: Component[]
	}
}

type ComponentText = {
	type: 'TEXT'
	props: {
		nodeValue: string
	}
}

type FiberEffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETE'

type Fiber = Component & {
	dom?: HTMLElement | Text
	parent?: Fiber
	child?: Fiber
	sibling?: Fiber
	alternate?: Fiber
	effectTag?: FiberEffectTag
}

let nextUnitOfWork: Fiber | undefined = undefined
let wipRoot: Fiber | undefined = undefined
let currentRoot: Fiber | undefined = undefined
let deletions: Fiber[] = []

function createComponent<Props = Record<string, unknown>>(
	type: keyof HTMLElementTagNameMap,
	props: Props,
	...children: (string | ComponentNode)[]
): ComponentNode<Props> {
	return {
		type,
		props: {
			...props,
			children: children.map((c) =>
				typeof c === 'string' ? createComponentText(c) : c,
			),
		},
	}
}

function createComponentText(text: string): ComponentText {
	return {
		type: 'TEXT',
		props: {
			nodeValue: text,
		},
	}
}

function createDom(fiber: Fiber): HTMLElement | Text {
	const dom =
		fiber.type === 'TEXT'
			? document.createTextNode(fiber.props.nodeValue)
			: document.createElement(fiber.type)
	if (fiber.type !== 'TEXT' && dom instanceof HTMLElement) {
		for (const key of Object.keys(fiber.props)) {
			if (key !== 'children') {
				dom[key] = fiber.props[key]
			}
		}
	}
	return dom
}

function updateDom(
	dom: HTMLElement | Text,
	prevProps?: Props,
	nextProps?: Props,
) {
	// TODO
}

function commitRoot() {
	for (const fiberToDelete of deletions) {
		commitWork(fiberToDelete)
	}
	commitWork(wipRoot?.child)
	currentRoot = wipRoot
	wipRoot = undefined
}

function commitWork(fiber?: Fiber) {
	if (!fiber || !fiber.dom) {
		return
	}
	const parent = fiber.parent?.dom as HTMLElement
	if (fiber.dom) {
		if (fiber.effectTag === 'PLACEMENT') {
			parent.appendChild(fiber.dom)
		} else if (fiber.effectTag === 'DELETE') {
			parent.removeChild(fiber.dom)
		} else if (fiber.effectTag === 'UPDATE') {
			updateDom(fiber.dom, fiber.alternate?.props, fiber.props)
		}
	}

	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

function render(component: Component, dom: HTMLElement) {
	wipRoot = { ...component, dom, alternate: currentRoot }
	deletions = []
	nextUnitOfWork = wipRoot
}

function workLoop(deadline: IdleDeadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}
	if (!nextUnitOfWork && wipRoot) {
		commitRoot()
	}
	requestIdleCallback(workLoop)
}

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	if (fiber.type === 'TEXT') {
		return fiber.parent
	}

	reconcileChildren(fiber)

	if (fiber.child) {
		return fiber.child
	}

	let nextFiber: Fiber | undefined = fiber
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling
		}
		nextFiber = nextFiber.parent
	}
	return undefined
}

function reconcileChildren(fiber: Fiber) {
	if (fiber.type === 'TEXT') {
		return
	}

	let oldFiber = fiber.alternate?.child
	let newFiber: Fiber | undefined = undefined

	let prevSibling: Fiber | null = null
	for (const component of fiber.props.children) {
		const isSameType = oldFiber?.type === component.type

		if (isSameType) {
			newFiber = {
				...component,
				dom: oldFiber.dom,
				parent: fiber,
				alternate: oldFiber,
				effectTag: 'UPDATE',
			}
		}
		if (component && !isSameType) {
			newFiber = {
				...component,
				parent: fiber,
				effectTag: 'PLACEMENT',
			}
		}
		if (oldFiber && !isSameType) {
			oldFiber.effectTag = 'DELETE'
			deletions.push(oldFiber)
		}

		newFiber = {
			...component,
			parent: fiber,
		}
		if (prevSibling) {
			prevSibling.sibling = newFiber
		} else {
			fiber.child = newFiber
		}
		prevSibling = newFiber
	}
}

export const ft = {
	createComponent,
	render,
}
