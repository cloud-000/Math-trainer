UI.dependencies(["authUI.css"])
UI.register("auth-form", `
<div class="flex expand cloud-ui-auth-wrapper">
    <div class="cloud-ui-auth-header-wrapper" style="margin-bottom: 50px">
        <h1 class="cloud-ui-auth-text">@param(heading)</h1>
    </div>
   <div class="flex expand cloud-ui-auth-fill-wrapper">
       <div class="flex expand cloud-ui-auth-input-container">
              
       </div>
       <button class="button flex" style-type="default" style="width: 100%">@param(prompt)</button>
       <a href="@param(otherLink)" class="cloud-ui-auth-link-other-action">@param(otherLinkText)</a>
   </div>
</div>
`, {
    heading: "Sign Up",
    prompt: "Submit",
    otherLink: "/sign-in",
    otherLinkText: "Already have an account? Sign In",
    email: true,
    username: true,
    submit: async () => {}
}, (element, params) => {
    let authInputContainer = element.querySelector(".cloud-ui-auth-input-container")
    // let authMethod = UI.component("auth-dropdown", {parent: element})
    // UI.add(element.querySelector(".cloud-ui-auth-header-wrapper"), authMethod)
    // let currentState;
    if (params.email) {
        UI.add(authInputContainer, UI.component("input-form", {
            placeholder: "Email Address", type: "email", validate: (s) => {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s)
        }, invalidMessage: () => {return "Enter a valid email address."} }))
    }

    if (params.username) {
        UI.add(authInputContainer, UI.component("input-form", {
            placeholder: "Username", type: "text", validate: (s) => {
                return 3 <= s.length && s.length <= 16 && /^[a-zA-Z0-9.-]+$/.test(s)
            }, invalidMessage: () => {
                return "Enter a valid username"
            }
        }))
    }

    UI.add(authInputContainer, UI.component("input-form", {placeholder: "Password", type: "password", validate: (s) => {
        return s.length > 6 && /^[\x20-\x7E]{6,}$/.test(s)
    }, invalidMessage: (s) => {
        return (s.length <= 6) ? "Password must be at least 7 characters" : "Password must not contain invalid characters"
    }}))
    /*element.setState = (index) => {
        currentState = params.states[index];
        authMethod.children[0].textContent = currentState.title;
    }*/
    element.querySelector("button").onclick = async () => {
        element.querySelector("button").setAttribute("disabled", "disabled")
        await params.submit.apply(null, [...authInputContainer.children].map(el => el.getValue()) )
        element.querySelector("button").removeAttribute("disabled")
        // currentState?.submit?.call(null, authInputContainer.children[0].getValue(),  authInputContainer.children[1].getValue())
    }
    // element.setState(0)
})

/*UI.register("auth-dropdown", `
<div class="cloud-ui-auth-dropdown">
    <h1 class="cloud-ui-auth-dropdown-text">Heading</h1>
    <div class="flex cloud-ui-auth-dropdown-content">
        <a>Sign Up</a>
        <a>Sign In</a>
    </div>
</div>
`,  {}, (element, params) => {
    let es = element.querySelector(".cloud-ui-auth-dropdown-content").children
    for (let i = 0; i < es.length; i++) {
        es[i].onclick = () => {
            params.parent.setState(i)
        }
    }
})*/