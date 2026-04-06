class App extends SpaApp {
    constructor() {
        super();
    }
    init() {
        super.init()
        // this.contentElement.remove()
        this.addSideElement("nav-bar", UI.component("nav-bar"), this.element, 0)
        // UI.add(this.element, UI.element("div", {class: "flex expand", style: "flex-direction: column"}))
        this.addSideElement("filters", UI.component("input-tagify"), UI.getChild(this.element, [1]))
        UI.add(this.getSideElement("filters"), UI.component("tagify-tag"), 0)
        // console.log(UI.getChild(this.getSideElement("nav-bar"), [0, 0]))
        this.addPage({
            text: "Home",
            icon: "home",
            href:  "/"
        }, new SearchPage())

        this.addPage({
            text: "Library",
            icon: "category_search",
            href: "/search"
        }, new SearchPage())

        this.setRoutes( "/", ["index.html"])
    }

    signIn() {

    }

    addPage(params, state) {
        super.createState(params["href"], state)
        if (this.dev) {
            params["href"] = this.devRoute + params["href"];
        }
        let button = UI.component("button-link-nav", params, {style: "width: 100%"})
        state.link(button)
        UI.add(
            UI.getChild(this.getSideElement("nav-bar"), [0, 0]),
            button
        )
    }

}