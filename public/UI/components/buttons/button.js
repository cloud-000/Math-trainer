UI.dependencies([
    "button.css"
])
UI.register("button", `
<button class="button flex" style-type="default">@param(text)</button>
<!--<button class="button flex" style-type="nav"></button>-->
`, {text: "Try modifying @param(text) to change this text"})

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

UI.register("button-icon", `
<button class="button flex" style-type="act" only-icon>
    <icon class="material-symbols-rounded">@param(icon)</icon>
</button>
`, {
    icon: "heart_plus"
})