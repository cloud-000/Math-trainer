UI.dependencies(["style.css"])
UI.register("nav-bar", `
<div class="flex expand no-select cloud-ui-nav-bar">
    <div class="flex expand cloud-ui-nav-container">
        <div class="flex expand" style="gap: 2px;">
           
        </div>
        <div class="flex expand" style="height: fit-content; margin-bottom: 8px;"></div>
    </div>
    <div class="cloud-ui-nav-buttons">
        
    </div>
</div>
`, {}, (element, params) => {
    element.addToBottom = (e) => {
        UI.add(element, e, [0, 1, 0])
    }
})