class HomePage extends MyAppPage {
    constructor() {
        super();
        this.element.style.setProperty("overflow-y", "auto");
        this.element.style.setProperty("gap", "6px");
        this.greetingElement = UI.rawHTML(`
        <div>
        <h1>Hello <span class="the-user-name">User</span>!!</h1>
        <br>
        <span> 
            This project is in it's very early phases, and many parts lack polish.
        </span>
        </div>
        `)
        this.recentAttemptsElement = UI.rawHTML(`
        <div class="flex expand recent-attempts-wrapper">
            <span style="font-size: calc(var(--text-size) + 2px);">Recent Attempts</span>
            <div class="flex expand recent-attempts"></div>
        </div>
        `)
        this.usernameElement = this.greetingElement.querySelector(".the-user-name")
        UI.add(this.element, [this.greetingElement, this.recentAttemptsElement])

    }

    async onUserLoaded() {
        super.onUserLoaded()
        this.usernameElement.textContent = this.manager.userStats.username
        // await this.updateProblemList()
        // this.usernameElement.textContent = this
    }

    enter() {
        super.enter()
        this.updateProblemList()
    }

    async updateProblemList() {
        let data = await this.manager.getCachedData("recent-problems", async () => {
            return (await this.manager.getRecentProblems(10))
        })
        console.log(data)
        this.recentAttemptsElement.children[1].innerHTML = ""
        for (let i = 0; i < data.length; i++) {
            let p = data[i]
            UI.add(this.recentAttemptsElement.children[1], UI.component("math-prev-attempt",
                p
            ))
        }
    }
}