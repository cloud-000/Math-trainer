UI.dependencies(["coolcount.css"])
UI.register("cool-count", `
<div class="flex cool-count-wrapper">
    <div class="cool-count-label">@param(label)</div>
    <div class="cool-count" style="--cool-count: @param(start)"></div>
</div>
`, {
    start: 0,
    end: 100,
    label: "Label: "
}, (element, params) => {
    element.setLabel = (label) => {
        element.querySelector(".cool-count-label").textContent = label;
    }
    element.setStart = (start) => {
        element.querySelector(".cool-count").style.setProperty("--cool-count", start);
    }
    element.begin = (end=params.end) => {
        element.querySelector(".cool-count").style.setProperty("--cool-count", end);
    }
    element.setGap = (gap) => {
        element.style.setProperty("gap", gap)
    }
})