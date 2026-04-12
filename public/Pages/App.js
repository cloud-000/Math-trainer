// Be forewarned, monkey patching and spaghetti awaits
class App extends SpaApp {
    constructor() {
        super();
        this.dev = false
    }
    init() {
        super.init()
        this.addSideElement("nav-bar", UI.component("nav-bar"), this.element, 0)
        this.getSideElement("nav-bar").addToBottom(UI.component("button", {text: "Logout"}, {}, {
            onclick: async () => {
                await signOut(this.client)
                this.userAuthed = false
                this.user = null
                this.userStats = null
                CStorage.setItem("logged-in", null)
                this.refresh()
            }
        }))

        this.addSideElement("filters", UI.element("div", {"class": "flex expand filter-search-head",}),
            UI.getChild(this.element, [1])
        )

        let addFilter = (name, element) => {
            UI.add(this.getSideElement("filters"), element)
            this.data[name] = element
        }

        let switch1 = UI.component("popup-menu", {
            items: [
                // { text: "General Type", onclick: () => this.setSwitch1(mockTypeChoices, 0) },
                { text: "Series", onclick: () => this.setSwitch1(this.data["test-series"], 1)},
                { text: "Test", onclick: () => this.setSwitch1(this.data["test-series"], 2) },
            ]
        })
        addFilter("topics", UI.component("input-tagify", {
            options: [{name: "A"}, {name: "C"}, {name: "G"}, {name: "N"}, {name: "Other", value: "O"}],
            placeholder: "Select (ACGN) or Other"
        }))
        addFilter("mock-type", UI.component("input-tagify", {
            options: Object.keys(TYPES),
            placeholder: "Select Mock Type"
        }))
        addFilter("test-series", UI.component("input-tagify", {
            options: ["Error"],
            placeholder: "Error"
        }, {}, {}, (e) => {
            UI.add(e, UI.component("button", {text: null, icon: "more_vert", styleType: "act"}, {}, {
                onclick: (e) => {
                    e.preventDefault()
                    setTimeout(() => switch1.open(e.clientX, e.clientY), 10);
                }
            }), 0)
        }))
        addFilter("tags", UI.component("input-tagify", {
            options: ["To be implemented..."],
            placeholder: "Tags yet to be made"
        }, {}))
        // --- Range Filters ----
        addFilter("range-elo", UI.component("labeled-range", {
            text: "Elo",
            min: 100,
            max: 2500,
            step: 1,
            lowerValue: 670,
            upperValue: 1500,
            labelInterval: 500,
            tickInterval: 100,
        }, {"style": "flex-basis: 250px; flex-grow: 1;"}))
        addFilter("range-quality", UI.component("labeled-range", {
            text: "Quality (Not Implemented)",
            min: 0,
            max: 10,
            step: 1,
            lowerValue: 2,
            upperValue: 5,
            labelInterval: 2,
            tickInterval: 1,
        }, {"style": "flex-basis: 250px; flex-grow: 1;"}))
        addFilter("range-year", UI.component("labeled-range", {
            text: "Year (Not Implemented)",
            min: 1974,
            max: 2026,
            step: 1,
            lowerValue: 2000,
            upperValue: 2020,
            labelInterval: 12,
            tickInterval: 3,
        }, {"style": "flex-basis: 100%"}))

        this.addPage({
            text: "Home",
            icon: "home",
            href:  "/"
        }, new HomePage());

        this.addPage({
            text: "Library",
            icon: "category_search",
            href: "/search"
        }, new SearchPage())

        this.addPage({
            text: "Train",
            icon: "exercise",
            href: "/train"
        }, new TrainPage())

        this.addPage({
            text: "Buzzer",
            icon: "sprint",
            href: "/countdown",
            disabled: true,
        }, new CountdownPage())

        this.createState("/sign-up", new SignUpPage())
        this.createState("/sign-in", new SignInPage())

        this.setRoutes( "/", ["index.html"], true)

        UI.add(document.body, switch1)
    }

    onClientReady() {
        this.setSwitch1(this.data["test-series"], 1);
    }

    // Supabase
    async setClient(client) {
        this.client = client
        if (CStorage.getItem("logged-in")) {
            await this.onUserSignIn()
        }
    }
    async onUserSignIn(details) {
        this.user = this.user ?? CStorage.getItem("logged-in")
        console.log(details)
        if (!this.user) {
            let {data, error} = (await this.client.auth.signInWithPassword(details))
            if (error || !data || data?.session == null) return {
                error: true,
                message: "Incorrect credentials"
            }
            this.user = data.user
            this.data.userId = this.user.id
            CStorage.setItem("logged-in", this.user)
        } else {
            // JWT getClaims
            this.data.userId = this.user.sub ?? this.user.id
        }
        this.userAuthed = true
        this.userStats = CStorage.getItem("userStats") ?? (await this.client.from("Profiles").select("*").eq("id", this.data.userId))?.data[0]
        await CStorage.asyncMemoize("db-contests", async () => {
            return (await this.client.from("Series").select("name, id")).data
        })
        await CStorage.asyncMemoize("db-tests", async () => {
            return (await this.client.from("Tests").select("name, id")).data
        })
        // Tags, and Mock Types
        // this.saveProgress()
        this.onClientReady()
        this.onUserLoaded()
        return true
    }

    async signup(method, details) {
        console.log(method, details)
        let {data, error} = await this.client.auth.signUp({
            email: details.email,
            password: details.password,
            options: {
                data: {username: details.username}
            }
        })
        if (error || !data.user) {
            return {error: true}
        }
        console.log(data, error)
        this.userId = data.user.id
        this.user = data.user
        await this.onUserSignIn()
        return true
    }

    async authenticate(method, details) {
        console.log(method, details)
        switch (method) {

            case "sign-up":
                return false;
            default:
            case "sign-in":
                // fetch username
                let {data, error} = await this.client.rpc("get_profile_email_by_username", {
                    p_username: details.username
                })
                if (error) {
                    return {
                        error: true,
                        message: error
                    }
                }
                return await this.onUserSignIn({
                    email: data[0].email,
                    password: details.password,
                })
        }
        return false
        // await super.authenticate(method, details);
    }

    saveProgress() {
        CStorage.setItem("userStats", this.userStats)
    }


    queryProblems({series, tests, topics, difficulty, tags, years}) {
        let qString =
`*,
 Tests!inner (
 ${[
    years?.length > 0 ? "year" : null,
    series?.length > 0 ? "series" : null,
    tests?.length > 0 ? "id" : null,
    "name",
].filter(k => k !== null && k!== undefined).join(",\n")}
)`
        let query = this.client.from("Problems")
         .select(qString)
        if (topics?.length > 0) query = query.in("topic", topics)
        if (tests?.length > 0) query = query.in("Tests.id", tests)
        if (difficulty?.length > 1) { query = query.gte("difficulty", difficulty[0]).lte("difficulty", difficulty[1]) }
        if (years?.length > 0) {
            query = (years.length === 1) ?
                query.eq("Tests.year", years[0]) :
                (query.gte("Tests.year", years[0])
                    .lte("Tests.year", years[1]))
        }
        return query
    }

    queryPagination(query, previousId, pageSize) {
        return query.order("id", {ascending: true})
            .gt("id", previousId)
            .limit(pageSize)
    }

    addPage(params, state, authRequired=true) {
        super.createState(params["href"], state, authRequired)
        if (this.dev) {
            params["href"] = this.devRoute + params["href"];
        }
        let button = UI.component("button-link-nav", params, {style: "width: 100%"})
        state.link(button)
        UI.add(
            UI.getChild(this.getSideElement("nav-bar"), [0, 0]),
            button
        )
    }

    setSwitch1(dropdown, whichIndex) {
        dropdown.destroyAllTags()
        dropdown.specialIndex = whichIndex
        switch (whichIndex) {
            case 0:
                break;
            case 1:
                dropdown.renamePlaceholder("Select Series")
                dropdown.setOptions(CStorage.getItem("db-contests").map(s => {
                    return {
                        name: s.name,
                        value: s.id
                    }
                }), false)

                break
            case 2:
                dropdown.renamePlaceholder("Select Test")
                dropdown.setOptions(CStorage.getItem("db-tests").map(s => {
                    return {
                        name: s.name,
                        value: s.id
                    }
                }), false)
                break;
        }

    }


    async calculateNewRating(details) {
        let sent = {
            p_problem_id: details.problemId,
            p_user_attempts: details.attempts,
            p_user_time: details.time,
            p_ideal_attempts: details.idealAttempts,
            p_ideal_time: details.idealTime
        }
        console.log(sent)
        const { data, error } = await this.client.rpc("process_problem_submission", sent);
        this.userStats.rating = data["new_rating"] ?? -1
        this.saveProgress()
        return data
    }
}