class Page404 extends SpaPage {
    constructor(m) {
        super(m)
        this.e404 = UI.element("h1", {}, {textContent: "404"})
        this.eText = UI.element("h1", {}, {textContent: "Page Not Found"})
        UI.add(this.element, this.e404)
        UI.add(this.element, this.eText)
    }

}