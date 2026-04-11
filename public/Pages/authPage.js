class AuthPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements = []
        UI.add(this.element, UI.component("auth-form", {states: [
            {
                name: "sign-up",
                title: "Sign Up",
                submit: (email, password) => {
                    console.log(this, email, password)
                }
            },
            {
                name: "sign-in",
                title: "Sign In",
                submit: async (email, password) => {
                    if (email != null && password != null) {
                        let success = await this.manager.authenticate("sign-in", {
                            type: "email",
                            email: email,
                            password: password
                        })
                        if (success) {
                            this.manager.state = "/"
                        } else {
                            alert("Sign In Failed")
                        }
                    }
                }
            }]
        }))
    }
}