UI.dependencies(["style.css"])
UI.register("input-box", `
<div class="flex cloud-ui-input-box">
    <input name="c" class="cloud-ui-input" type="text" placeholder="@param(placeholder)"/>    
</div>
`, {placeholder: "Type something..."}, (element, params) => {
    if (params.icon) {
        UI.add(element, UI.component("icon", {text: params.icon}), 0)
    }
})