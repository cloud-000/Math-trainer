class SearchPage extends MyAppPage {
    constructor() {
        super();
        this.shownSideElements.push("filters")
        let topbar = UI.element("div", {"class": "flex expand", "style": "flex-direction: row; justify-content: space-between; height: fit-content; padding: 8px; gap: 4px"})
        this.resultsElement =  UI.element("div", {"class": "flex expand results-wrapper"})
        this.pageSize = 5
        this.lastSearchId = -1
        UI.add(topbar, UI.component("input-box", {placeholder: "Text search", icon: "search"}, {}))
        UI.add(topbar, UI.component("button", {text: "Go!", icon: "search"}, {"style-type": "default", "style": "flex-basis: 100%; flex-grow: 1;"}, {
            onclick: async () => {
                // Fix later
                this.clearSearchResults()
                let {data} = await this.problemQuery().order("id", {ascending: true}).limit(this.pageSize)
                this.lastSearchId = data[data.length - 1]?.id
                console.log(data)

                this.resultsElement.innerHTML = ""
                this.setSearchResults(data)
            }
        }))
        UI.add(this.element, [topbar, UI.element("div",  {"class": "flex expand search-results-wrapper-wrapper"})]);
        UI.add(this.element, this.resultsElement, [1, 0])
        UI.add(this.element, UI.component("button", {text: "", icon: "keyboard_double_arrow_down"},
            {style: "margin-top: 6px"}, {
            onclick: async () => {
                let {data} = await this.queryMore()
                if (!data) return
                if (data.length === 0) {
                    console.log("No more results found")
                }
                this.lastSearchId = data[data.length - 1]?.id
                console.log(data)
                this.setSearchResults(data)
            }
            }, (element) => {
            element.classList.add("no-select")
        }), [1, 1])

        for (let i = 0; i < 1; i++) {
            UI.add(this.resultsElement, UI.component("math-problem", {}), 0)
        }
    }

    enter() {
        super.enter();
        console.log("EEEE")
    }

    clearSearchResults() {
        console.log("TODO: Safe DELETE that removes evt listeners etc.")
        this.resultsElement.innerHTML = "Loading...";
    }

    problemQuery() {
        let useSeries = (this.manager.data["test-series"].specialIndex === 1)
        return this.manager.queryProblems({
            [(useSeries) ? "series" : "tests"]: this.manager.data["test-series"].getCurrentTags(),
            topics: this.manager.data["topics"].getCurrentTags(),
            difficulty: [this.manager.data["range-elo"].children[1].getLowerValue(), this.manager.data["range-elo"].children[1].getUpperValue()]
        })
    }

    queryMore() {
        return this.manager.queryPagination(this.problemQuery(), this.lastSearchId, this.pageSize)
    }

    setSearchResults(results) {
        for (let i = 0; i < results.length; i++) {
            UI.add(this.resultsElement, UI.component("math-problem", {
                text: results[i]["statement"],
                n: (results[i]["n"] + 1),
                answers: results[i]["answers"],
                answer_index: results[i]["answer_index"],
                test: results[i]["Tests"]["name"],
                aops_id: results[i]["aops_id"],
                elo: results[i]["difficulty"],
                topic: results[i]["topic"]
            }))
        }
    }
}