UI.dependencies(["input.css"])
UI.register("input-form", `
<div class="flex cloud-ui-input-form-wrapper">
    <input name="c" class="cloud-ui-input-form" spellcheck="false" type="@param(type)" placeholder="@param(placeholder)"/>
</div>`, {
    placeholder: "Enter a value",
    type: "text",
    validate: (s) => true
}, (element, params) => {
    element.getValue = () => {
        if (params.validate(element.children[0].value)) {
            return element.children[0].value
        } else {
            alert(`invalid value ${element.children[0].value}`)
            return null
        }
    }
})