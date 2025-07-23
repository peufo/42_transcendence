customElements.define(
	'ft-page-local-new',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="max-w-lg m-auto flex flex-col gap-6">
                    <div>
                        <h2>TODO form vs in same keyboard</h2>
                        <ul>
                            <li>set Player 1 name</li>
                            <li>set Player 2 name</li>
                        </ul>

                        <a href="/local/play?playerA=Bob&playerB=Alice" class="btn btn-border">
                            <ft-icon name="swords" class="mr-1"></ft-icon>
                            <span>Play versus 2D</span>
                            <ft-icon name="swords" class="ml-1"></ft-icon>
                        </a>
                    </div>
                    <div>
                        <a href="/local/play/babylon" class="btn btn-border">
                            <span> Play versus Babylon version </span>
                        </a >
                    </div>
                    <div>
                        <h3 class="text-sm/6 font-semibold text-gray-900 my-3">
                            AI opponents
                        </h3>
                        <div class="grid grid-cols-3 gap-2">
                            <a href="/local/play?bot=easy" class="btn btn-border">
                                <ft-icon name="baby" class="mr-1"></ft-icon>
                                <span>Baby</span>
                            </a>
                            <a href="/local/play?bot=medium" class="btn btn-border">
                                <ft-icon name="bot" class="mr-1"></ft-icon>
                                <span>Kevin</span>
                            </a>
                            <a href="/local/play?bot=hard" class="btn btn-border">
                                <ft-icon name="skull" class="mr-1"></ft-icon>
                                <span>Terminator</span>
                            </a>
                        </div>
                    </div>
                </div>
			`
		}
	},
)
