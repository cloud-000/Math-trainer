class SignUpPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements = []
        UI.add(this.element, UI.component("auth-form", {
            submit: async (email, username, password) => {
                if (email && username && password) {
                    let success =await this.manager.signup("normal", {
                        email: email,
                        username: username,
                        password: password,
                    })

                    if (success === true) {
                        alert(`Verify your account via email ${email}`)
                        this.manager.state = "/"
                        console.log(this.manager.state)
                    }

                }
            }
        }))
    }
}

class SignInPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements = []
        UI.add(this.element, UI.component("auth-form", {
            heading: "Sign In",
            prompt: "Sign In",
            otherLink: "/sign-up",
            otherLinkText: "Don't have an account? Sign Up",
            email: false,
            submit: async (username, password) => {
                // await new Promise((resolve) => setTimeout(resolve, 1000))
                if (username != null && password != null) {
                    let success = await this.manager.authenticate("sign-in", {
                        username: username,
                        password: password
                    })
                    if (success === true) {
                        this.manager.state = "/"
                    }
                }
            }
        }))
    }
}