class HomePage extends MyAppPage {
    constructor() {
        super();
        this.greetingElement = UI.rawHTML(`
        <div>
        <h1>Hello <span class="the-user-name">User</span>!!</h1>
        <br>
        <span> 
            This project is in it's very early phases, and many parts lack polish.
        </span>
        </div>
        `)
        this.usernameElement = this.greetingElement.querySelector(".the-user-name")
        UI.add(this.element, this.greetingElement)

    }

    onUserLoaded() {
        super.onUserLoaded()
        this.usernameElement.textContent = this.manager.userStats.username
        // this.usernameElement.textContent = this
    }
}