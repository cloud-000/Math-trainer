UI.dependencies([
    "button.css"
])
UI.register("button", `
<button class="button flex" style-type="@param(styleType)"><span>@param(text)</span>
</button>
<!--<button class="button flex" style-type="nav"></button>-->
`, {
    text: "Try modifying @param(text) to change this text",
    styleType: "default"
    },
    (element, params) => {
    if (Object.hasOwn(params, "icon")) {
        if ((params.text ?? "").trim() === "") {
            UI.getChild(element, [0]).remove()
        }
        UI.add(element, UI.component("icon", {text: params.icon}), 0)
    }
})

UI.register("button-nav", `
<button class="button flex" style-type="nav">
    <icon class="material-symbols-rounded">@param(icon)</icon>
    <span>@param(text)</span>
</button>
`, {
    text: "Try modifying @param(icon)",
    icon: "heart_plus"
})

UI.register("button-link-nav", `
<a class="button flex" style-type="nav"  href="@param(href)">
    <icon class="material-symbols-rounded">@param(icon)</icon>
    <span>@param(text)</span>
</a>
`, {
    text: "I am an redirect?",
    icon: "link",
    href: "/testing"
})