class SpaPage extends State {
    constructor(m) {
        super(m)
        this.element = UI.element("div", {class: "flex expand cloud-ui-spa-page"})
        this.triggerElement = null
        this.shownSideElements = []
    }

    onUserLoaded() {}

    enter() {
        super.enter()
        this.manager.setElement(this.element)
        this.manager.updateSideElementVisibility(this.shownSideElements)
        this.triggerElement?.setAttribute("active", "true")
    }

    exit() {
        super.exit()
        this.triggerElement?.removeAttribute("active")
        this.element.remove()
    }

    link(element) {
        this.triggerElement = element
        /*element.onclick = () => {
            // this.manager.state = this.name
        }*/
    }
}