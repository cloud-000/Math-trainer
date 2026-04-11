class SpaApp extends ManageState {
    constructor() {
        super();
        this.devRoute = "/OrzMath/public/"
        this.dev = true
        this.routes = {}
        this.element = UI.element("div", {
            "class": "expand flex cloud-ui-spa-wrapper"
        })
        this.contentElement = UI.element("div", {
            "class": "expand flex cloud-ui-spa-content-wrapper"
        })
        this.sideElements = {} // HashMap
        this.data = {}
    }

    onUserLoaded() {
        this.states.forEach(s => s.onUserLoaded())
    }

    addTo(element) {UI.add(element, this.element)}

    addContentTo(parent) {UI.add(parent, this.contentElement)}

    setElement(element) {
        UI.add(this.contentElement, element)
    }

    init() {
        this.createState("404", new Page404(this))
        window.navigation.addEventListener("navigate", (event) => {
            if (!event.canIntercept) return
            // event.preventDefault()
            let path = new URL(event.destination.url).pathname
            console.log(`Intercepted: ${path}`)
            this.router(path)
            event.intercept({
                async handler() {

                }
            })
        })
        this.addContentTo(this.element)
    }

    async authenticate(method, details) {return false}

    createState(name, state) {
        super.createState(name, state)
        this.routes[name] = name
    }

    setRoutes(stateName, pages) {
        pages.forEach((page) => {
            this.routes[page] = stateName
        })
    }

    router(path) {
        let exists = Object.hasOwn(this.routes, path)
        if (!exists && this.dev) {
            path = path.replace(this.devRoute, "")
            exists = Object.hasOwn(this.routes, path)
        }
        if (exists) {
            this.state = this.routes[path]
        } else {
            this.state = "404"
        }
    }

    refresh() {
        this.router(new URL(window.location.href).pathname)
    }

    addSideElement(name, element, parent, index=parent.children.length) {
        this.sideElements[name] = element
        element.classList.add("cloud-ui-spa-side-element")
        UI.add(parent, element, index)
    }

    getSideElement(name) {
        return this.sideElements[name]
    }

    /**
     * Sets the visibility of the specified side element
     * @param{String} name
     * @param{Boolean} shown
     */
    setSideElementVisibility(name, shown) {
        let element = this.sideElements[name]
        let isAlreadyShown =
            (element.getAttribute("cloud-ui-visible") !== "false") ||
            !element.hasAttribute("cloud-ui-visible")

        if (shown === isAlreadyShown) return
        if (shown) {
            element.removeAttribute("cloud-ui-visible")
        } else {
            element.setAttribute("cloud-ui-visible", shown.toString())
        }
    }

    updateSideElementVisibility(shown) {
        for (let key of Object.keys(this.sideElements)) {
            this.setSideElementVisibility(key, shown.includes(key))
        }
    }
}