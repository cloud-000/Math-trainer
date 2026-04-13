UI.dependencies(["mathPrevAttempt.css"])
UI.register("math-prev-attempt", `
<div class="flex expand math-prev-attempt">
    <div class="flex prev-attempt-source-wrapper">
        <div>
            @param(rating_diff)
        </div>
        <div class="prev-date-time"></div>   
    </div>
    <div class="prev-attempt-statement-wrapper">
   
    </div>
</div>
`, {
    test_name: "A test yay"
}, (element, params) => {
    let statement = UI.component("math-statement", {text: params["statement"]})
    let source = UI.component("math-problem-source", {
        test: params["test_name"],
        n: (params["n"] + 1),
        elo: (params["difficulty"]),
        topic: params["topic"]
    })
    if (params.aops_id) {source.setAoPsTopicID(params.aops_id)}
    element.querySelector(".prev-date-time").textContent = new Date(params["created_at"]).toLocaleDateString()
    UI.add(element, source, [0, 0])
    UI.add(element, statement, [1, 0])
})
