class App extends SpaApp {
    constructor() {
        super();
    }
    init() {
        super.init()
        // this.contentElement.remove()
        this.addSideElement("nav-bar", UI.component("nav-bar"), this.element, 0)
        // UI.add(this.element, UI.element("div", {class: "flex expand", style: "flex-direction: column"}))
        this.addSideElement("filters", UI.element("div", {"class": "flex expand filter-search-head",}),
            UI.getChild(this.element, [1])
        )

        let switch1 = UI.component("popup-menu", {
            items: [
                { text: "General Type", onclick: () => this.setSwitch1(mockTypeChoices, 0) },
                { text: "Series", onclick: () => this.setSwitch1(mockTypeChoices, 1)},
                { text: "Test", onclick: () => this.setSwitch1(mockTypeChoices, 2) },
            ]
        })
        let acgnChoices = UI.component("input-tagify", {
            options: ["A", "C", "G", "N", "Other"],
            placeholder: "Select (ACGN) or Other"
        })
        let mockTypeChoices = UI.component("input-tagify", {
            options: Object.keys(TYPES),
            placeholder: "Select Mock Type"
        }, {}, {}, (e) => {
            UI.add(e, UI.component("button", {text: null, icon: "more_vert", styleType: "act"}, {}, {
                onclick: (e) => {
                    e.preventDefault()
                    setTimeout(() => switch1.open(e.clientX, e.clientY), 10);
                }
            }), 0)
        })
        let tagChoices = UI.component("input-tagify", {
            options: ["To be implemented..."],
            placeholder: "Tags yet to be made"
        })
        UI.add(this.getSideElement("filters"), mockTypeChoices)
        UI.add(this.getSideElement("filters"), acgnChoices)
        UI.add(this.getSideElement("filters"), tagChoices)

        this.setSwitch1(mockTypeChoices, 0)

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

        UI.add(document.body, switch1)
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

    setSwitch1(dropdown, whichIndex) {
        dropdown.destroyAllTags()
        switch (whichIndex) {
            case 0:
                dropdown.renamePlaceholder("Mock Types")
                dropdown.setOptions(Object.keys(TYPES), false)
                break;
            case 1:
                dropdown.renamePlaceholder("Select Series")
                dropdown.setOptions(ALL_SERIES, false)
                break
            case 2:
                dropdown.renamePlaceholder("Select Test")
                dropdown.setOptions(["Why did commit that... :("], false)
                break;

        }

    }

}