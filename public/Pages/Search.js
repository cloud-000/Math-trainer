class SearchPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements.push("filters")
        UI.add(this.element, UI.component("button", {text: "", icon: "search"}, {"style-type": "default"}, {
            onclick: async () => {

            }
        }))
    }

    enter() {
        super.enter();
        console.log("EEEE")
    }
}