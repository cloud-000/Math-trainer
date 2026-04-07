class App extends SpaApp {
    constructor() {
        super();
    }
    init() {
        super.init()
        // this.contentElement.remove()
        this.addSideElement("nav-bar", UI.component("nav-bar"), this.element, 0)
        // UI.add(this.element, UI.element("div", {class: "flex expand", style: "flex-direction: column"}))
        this.addSideElement("filters", UI.element("div", {
            "class": "flex expand",
            "style": "height: fit-content; flex-wrap: wrap; gap: 6px"
        }),
            UI.getChild(this.element, [1])
        )

        let acgnChoices = UI.component("input-tagify", {
            options: ["A", "C", "G", "N", "Other"],
            placeholder: "Select (ACGN) or Other"
        })
        let mockTypeChoices = UI.component("input-tagify", {
            options: Object.keys(TYPES),
            placeholder: "Select Mock Type"
        })
        UI.add(this.getSideElement("filters"), acgnChoices, 0)
        UI.add(this.getSideElement("filters"), mockTypeChoices, 0)
        UI.add(this.getSideElement("filters"), UI.component("button", {text: "Search!"}, {}, {
            onclick: async () => {

            }
        }))
        // this.getSideElement("filters")

            // .addTag(UI.component("tagify-tag"))

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

    // Supabase
    signIn(client) {
        this.client = client
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