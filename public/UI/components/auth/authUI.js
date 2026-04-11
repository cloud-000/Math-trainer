UI.dependencies(["authUI.css"])
UI.register("auth-form", `
<div class="flex expand cloud-ui-auth-wrapper">
    <div class="cloud-ui-auth-header-wrapper" style="margin-bottom: 50px">
        
    </div>
   <div class="flex expand cloud-ui-auth-fill-wrapper">
       <div class="flex expand cloud-ui-auth-input-container">
              
       </div>
       <button class="button flex" style-type="default" style="width: 100%">Sign In</button>
   </div>
</div>
`, {
    heading: "Cool",
    states: [{
        name: "sign-up",
        title: "Sign Up",
    },
    {
        name: "sign-in",
        title: "Sign In",
    }]
}, (element, params) => {
    let authInputContainer = element.querySelector(".cloud-ui-auth-input-container")
    let authMethod = UI.component("auth-dropdown", {parent: element})
    UI.add(element.querySelector(".cloud-ui-auth-header-wrapper"), authMethod)
    let currentState;
    UI.add(authInputContainer, UI.component("input-form", {
        placeholder: "Email Address", type: "email", validate: (s) => {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s)
        }}))
    UI.add(authInputContainer, UI.component("input-form", {placeholder: "Password", validate: (s) => {
        console.log(s)
        return s.length > 5
    }}))
    element.setState = (index) => {
        currentState = params.states[index];
        authMethod.children[0].textContent = currentState.title;
    }
    element.querySelector("button").onclick = () => {
        currentState?.submit?.call(null, authInputContainer.children[0].getValue(),  authInputContainer.children[1].getValue())
    }
    element.setState(0)
})

UI.register("auth-dropdown", `
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
})