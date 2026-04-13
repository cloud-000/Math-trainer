class TrainPage extends MyAppPage {
    constructor() {
        super()
        this.data = {
            attempts: 0,
            time: 0,
            range: 300,
        }
        this.timer = new CTimer()
        this.ratingElement = UI.component("cool-count", {label: "Elo: "},  {style: "margin-left: 4px"}, {
            updateDisplay: () => {
                this.ratingElement.begin(this.manager.userStats?.rating ?? 0)
            }
        }, (element) => {element.classList.add("user-elo-display"); element.setGap("4px")})

        this.element.classList.add("trainer-wrapper")
        this.header = UI.component("ui-bar", {border: "bottom"})
        this.footer = UI.component("ui-bar", {border: "top"})
        this.middle = UI.element("div", {"class": "flex expand trainer-main-wrapper"})
        this.timerElement = UI.element("span", {"class": "no-select problem-timer"}, {textContent: "0: 00"})
        this.problemStatementWrapper = UI.element("div", {"class": "flex expand trainer-statement-wrapper"})
        this.problemSubmissionWrapper = UI.element("div", {"class": "flex expand trainer-submission-wrapper"})
        this.problemSourceWrapper = UI.element("div", {"class": "flex expand trainer-source-wrapper"})
        this.belowStatementElement = UI.element("div", {"class": "flex expand trainer-below-statement"})

        this.header.addToSection(0, this.ratingElement)
        this.header.addToSection(2, this.timerElement)
        this.header.addToSection(2, UI.component("button", {text: "", icon: "tune"}))

        this.footer.addToSection(0, UI.component("button", {text: "Report", icon: "flag"}))
        this.footer.addToSection(2, UI.component("button", {text: "skip", icon: "arrow_forward"}, {},{
            onclick: async () => {
                await this.generateNewProblem()
            }
        }))
        this.submitButton = UI.component("button", {text: "Submit", icon: "send"}, {}, {
            onclick: async () => {
                this.submitButton.setAttribute("disabled", "disabled")
                let result = this.problemSubmissionWrapper.children[0]?.handleAnswer(true)
                if (result === 0) { // no answer
                    await this.generateNewProblem()
                    this.submitButton.removeAttribute("disabled")
                    return;
                }
                this.data.attempts += 1
                if (result === 1) {
                    let {change, new_rating} = await this.manager.calculateNewRating({
                        idealTime: 60*3.5,
                        time: this.data.time,
                        idealAttempts: 1,
                        attempts: this.data.attempts,
                        problemId: this.currentProblem.id,
                        rating: this.currentProblem.difficulty,
                    })
                    this.manager.data["recent-problems"].unshift(Object.assign({
                        created_at: (new Date()).toISOString(),
                        rating_diff: change
                    }, this.currentProblem))
                    this.manager.updateCachedData("recent-problems")
                    // this.time = 0
                    // this.attempts = 0
                    await this.generateNewProblem()
                } else { // wrong

                }
                this.ratingElement.updateDisplay()
                this.submitButton.removeAttribute("disabled")
            }
        })
        UI.add(this.belowStatementElement, this.submitButton)

        UI.add(this.problemStatementWrapper, UI.component("math-statement", {
            text: "Hello World $\\LaTeX$",
        }))
        UI.add(this.problemSubmissionWrapper, UI.component("math-problem-answer-submission", {index: -1, mode: SUBMIT_MODE.SELECT}))
        UI.add(this.problemSourceWrapper, UI.component("math-problem-source"))

        UI.add(this.middle, [this.problemSourceWrapper, this.problemStatementWrapper, this.problemSubmissionWrapper, this.belowStatementElement])
        UI.add(this.element, [this.header, this.middle, this.footer])

    }

    onUserLoaded() {
        super.onUserLoaded()

        this.ratingElement.updateDisplay()
    }

    setProblem(problem) {
        console.log(problem)
        this.currentProblem = problem
        if (!this.currentProblem) {return}
        this.problemStatementWrapper.children[0].setText(problem["statement"])
        this.problemSubmissionWrapper.children[0].setSubmitDetails(problem.answers, problem.answer_index)
        let source = this.problemSourceWrapper.children[0]
        source.setAoPsTopicID(problem.aops_id)
        source.setN(problem.n + 1)
        source.setName(problem.Tests?.name || problem.test_name)
        source.setElo(problem.difficulty)
        source.setTopic(problem.topic)
    }

    async generateNewProblem() {
        clearInterval(this.timeInterval)
        this.data.time = 0
        this.data.attempts = 0

        const { data } = await this.manager.client
            .rpc('get_random_problem', {
                target_min_diff: this.manager.userStats.rating - this.data.range,
                target_max_diff: this.manager.userStats.rating + this.data.range,
                p_user_id: this.manager.userStats.id,
                p_limit: 1
            });

        this.setProblem(data[0])

        this.timer.start()
        this.timeInterval = setInterval(() => {
            this.data.time = this.timer.time/1000
            let sec = Math.round(this.data.time)
            let min = Math.floor(sec/60)
            let hour = Math.floor(min/60)
            this.timerElement.textContent = `${hour > 0 ?( hour + ": ") : ""}${min%60}: ${((sec%60) < 10 ? "0" : "") + sec%60}`
        }, 1000)
    }
}