UI.dependencies(["input.css"])
UI.register("input-form", `
<div class="flex cloud-ui-input-form-wrapper">
    <div class="flex cloud-ui-input-form">
        <input name="c" class="cloud-ui-input-form-input" spellcheck="false" type="@param(type)" placeholder="@param(placeholder)"/>
    </div>
    <span class="cloud-ui-input-error-message">Error</span>
</div>`, {
    placeholder: "Enter a value",
    type: "text",
    validate: (s) => true,
    invalidMessage: (s) => "Invalid value"
}, (element, params) => {
    let input = element.querySelector("input")
    let errorElement = element.querySelector(".cloud-ui-input-error-message")
    element.getValue = () => {
        if (params.validate(input.value)) {
            return input.value
        } else {
            return null
        }
    }

    input.oninput = () => {
        if (!params.validate(input.value) && input.value.length !== 0) {
            element.setAttribute("invalid", "true")
            errorElement.textContent = params.invalidMessage(input.value)
            return
        }
        element.removeAttribute("invalid")
    }
    let showHide
    element.destroy = () => {
        input.oninput = null
        input = null
        showHide?.destroy()
    }

    if (params.type === "password") {
        showHide = UI.element("div", {"class": "no-select cloud-ui-show-hide-password"}, {textContent: ""})
        showHide.onclick = () => {
            if (showHide.getAttribute("shown")) {
                showHide.removeAttribute("shown")
                input.type = "password"
            } else {
                showHide.setAttribute("shown", "true")
                input.type = "text"
            }
        }
        showHide.destroy = () => {
            showHide.onclick = null
            showHide = null
        }
        UI.add(input.parentNode, showHide)
    }
})