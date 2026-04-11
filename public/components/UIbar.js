UI.dependencies(["UIbar.css"])
UI.register("ui-bar", `
<div class="no-select flex expand cloud-ui-bar">
    <div class="flex ui-bar-section-wrapper ui-bar-start"></div>
    <div class="flex expand ui-bar-section-wrapper ui-bar-middle"></div>
    <div class="flex ui-bar-section-wrapper ui-bar-end"></div>
</div>
`, {
    border: "bottom"
}, (element, params) => {
    element.addToSection = (section, e) => {
        UI.add(element, e, [section, UI.getChild(element, [section]).children.length])
    }
    element.style.setProperty(`border-${params.border}`, "var(--bd-size) solid var(--c-bd)")
})