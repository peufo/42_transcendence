import { createEffect, createSignal } from './signal.js'

main()
export function main() {
	const root = createRoot()
	createEffect(() => {
		document.body.innerHTML = root.render()
	})
}

function createRoot() {
	const [title, setTitle] = createSignal('My App')
	let counter = 0
	setInterval(() => {
		setTitle(`My App ${counter++}`)
		console.log('prout')
	}, 1000)

	return {
		render() {
			return /*html*/ `
                ${header({ title })}
                <main>
                    <h2>Salut</h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur nisi iure delectus adipisci suscipit rerum fuga accusantium quibusdam? Harum eaque fugit nam ex molestias error sequi praesentium illo sit adipisci!</p>
                </main>
                <style>
                    main {
                        border: solid grey 2px;
                        border-radius: 4px;
                        padding: 4px 8px;
                    }
                </style>
            `
		},
	}
}

function header(props: { title: () => string }): string {
	return /*html*/ `
    <header>
      <div>
        <h1>${props.title()}</h1>
      </div>
    </header>
    <style>
      header {
        display: flex;
        align-items: center;
      }
    </style>
  `
}
