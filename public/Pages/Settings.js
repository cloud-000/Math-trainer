class SettingsPage extends MyAppPage {
    constructor() {
        super();
        UI.add(this.element, UI.component("button", {text: "Hi Guys"}))
        UI.add(this.element, UI.component("button-nav", {text: "home", icon: "settings"}))
        UI.add(this.element, UI.component("button-link-nav", {text: "Settings"}))
        UI.add(this.element, UI.element("h2", {}, {textContent: "very cool"}))
    }

    enter() {
        super.enter();
        console.log("EEEE")
    }
}