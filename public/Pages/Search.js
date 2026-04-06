class SearchPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements.push("filters")
        UI.add(this.element, UI.component("button", {text: "Hi Guys"}))

        UI.add(this.element, UI.element("h2", {}, {textContent: "verl"}))
    }

    enter() {
        super.enter();
        console.log("EEEE")
    }
}