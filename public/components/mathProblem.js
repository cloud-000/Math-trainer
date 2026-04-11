UI.register("math-problem", `
<div class="flex math-problem-wrapper">

    <div class="math-problem-statement-wrapper"></div>
</div>
`,{
    n: 42,
    test: "A sample test name",
    answers: ["1", "2", "3", "4", "\\text{Awesome Sauce}"],
    answer_index: 2,
    text: "Let $\\LaTeX$ be a sample problem"
}, (element, params) => {

    let mathStatement = UI.component("math-statement", {text: params.text})
    let choiceWrapper = UI.component("math-problem-answer-submission", {
        choices: params.answers,
        index: params.answer_index,
    })
    let source = UI.component("math-problem-source", params)
    element.setAnswer = (choices, index) => {
        choiceWrapper.setSubmitDetails(choices, index)
    }
    element.setAoPsTopicID = (id) => {
        source.setAoPsTopicID(id)
    }
    // element.setAnswer(params.answers, params.answer_index)
    element.setAoPsTopicID(params.aops_id)
    UI.add(element, source, 0)
    UI.add(element.querySelector(".math-problem-statement-wrapper"), [mathStatement, choiceWrapper], 0)
})

UI.register("math-problem-source", `
    <div class="flex math-problem-source">
        <div class="flex" style="flex-direction: row; gap: 6px;">
            <a class="math-problem-test-name">@param(test)</a>
            <div class="flex no-select math-problem-n">
                <a target="_blank">@param(n)</a>
                <div class="material-symbols-rounded math-problem-link-icon">open_in_new</div>
            </div>
        </div>
        <div class="flex" style="flex-direction: row; gap: 6px;">
            <span class="math-problem-elo">@param(elo)</span>
            <span class="math-problem-math-type">@param(topic)</span>
        </div>
    </div>
`, {
    test: "testing",
    n: 67,
    elo: 670,
    topic: "O"
}, (element, params) => {
    element.cloudData = {}
    element.setName = (name) => {
        element.querySelector(".math-problem-test-name").textContent = name
    }
    element.setAoPsTopicID = (id) => {
        element.cloudData["aops-id"] = id
        if (id) {
            element.querySelector(".math-problem-n").children[0]
                .setAttribute("href", `http://artofproblemsolving.com/community/h${id}`)
        }
    }
    element.setN = (n) => {
        element.cloudData["n"] = n
        element.querySelector(".math-problem-n").children[0].textContent = n
    }

    element.setElo = (n) => {
        element.cloudData["elo"] = n
        element.querySelector(".math-problem-elo").textContent = n
    }

    element.setTopic = (t) => {
        element.cloudData["topic"] = t
        element.querySelector(".math-problem-math-type").textContent = t
    }
})

const SUBMIT_MODE = {
    NONE: 0,
    SELECT: 1,
    AUTO_CHECK: 2
}

UI.register("math-problem-answer-submission", `
<div class="flex math-problem-answer-choice-wrapper"></div>
`, {
    choices: ["\\text{Yes}", "1", "\\text{No}", "Maybe"],
    mode: SUBMIT_MODE.AUTO_CHECK,
}, (element, params) => {
    element.cloudData = {}
    let mode = params.mode
    let choiceElements;
    let lastChoice = null
    element.setSubmitDetails = (choices, index) => {
        choiceElements = element.querySelectorAll(".math-problem-answer-choice")
        element.clearAnswerListeners()
        element.innerHTML = ""
        if (choices?.length > 1) {
            for (let i = 0; i < choices.length; i++) {
                UI.add(element ,UI.component("math-problem-answer-choice", {
                    letter: String.fromCharCode(i + 65),
                    text: choices[i],
                    index: i
                }))
            }
        }
        choiceElements = element.querySelectorAll(".math-problem-answer-choice")
        element.updateAnswerListeners()
        element.cloudData["answers"] = choices
        element.cloudData["answer_index"] = index ?? -1
    }
    element.handleAnswer = (handleAnimations=true) => {
        // assume choices for now, fix later
        if (element.cloudData["answer_index"] === lastChoice?.answer_index) {
            if (handleAnimations) lastChoice.setAnswerState(1, false)
            return 1
        } else {
            if (lastChoice == null || element.cloudData["answer_index"] < 0) {
                if (handleAnimations) lastChoice?.setAnswerState(0, false)
                return 0
            }
            if (handleAnimations) {
                lastChoice?.removeAttribute("active")
                lastChoice.setAnswerState(-1, false)
                lastChoice = null
            }
            return -1
        }
    }
    element.clearAnswerListeners = () => {
        lastChoice = null
        choiceElements.forEach(e => {
            e.onclick = null
        })
    }
    ["select", "auto"].forEach(className => {
        element.classList.remove(`cloud-ui-submit-${className}`)
    })
    element.setMode = (m) => {mode = m}
    element.updateMode = () => {
        choiceElements = element.querySelectorAll(".math-problem-answer-choice")
        element.clearAnswerListeners()
        element.updateAnswerListeners()
    }
    element.updateAnswerListeners = () => {
        switch (mode) {
            case SUBMIT_MODE.SELECT:
                element.classList.add("cloud-ui-submit-select")
                choiceElements.forEach(choice => {
                    choice.onclick = () => {
                        lastChoice?.removeAttribute("active")
                        if (lastChoice?.answer_index === choice.answer_index) {
                            lastChoice = null
                            return
                        }
                        choice.setAttribute("active", "true")
                        lastChoice = choice
                    }
                })
                break
            case SUBMIT_MODE.AUTO_CHECK:
                element.classList.add("cloud-ui-submit-auto")
                choiceElements.forEach(choice => {
                    choice.onclick = () => {
                        if (element.cloudData["answer_index"] < 0) {
                            choice.setAnswerState(0, false)
                            return
                        }
                        if (choice.answer_index === element.cloudData["answer_index"]) {
                            choice.setAnswerState(1, false)
                        } else {
                            choice.setAnswerState(-1, false)
                        }
                    }
                })
                break;
            case SUBMIT_MODE.NONE:
            default:
                break;
        }
    }
    element.setSubmitDetails(params.choices, params.index)
})

UI.register("math-problem-answer-choice", `
<div class="flex no-select math-problem-answer-choice">
    <span class="the-letter-choice">@param(letter)</span>
    <span class="the-answer-choice">@param(text)</span>
</div>
`, {
    text: 67,
    letter: "A",
    index: 0,
}, (element, params) => {
    element.render = (letter, text) => {
        katex.render(`\\textbf{(${letter ?? element.answerLetter})}`, element.querySelector(".the-letter-choice"), {
            macros
        })
        katex.render((text ?? element.answerText).replace("$", ""), element.querySelector(".the-answer-choice"), {
            macros
        })
    }
    element.setAnswerState = (state, persist=false) => {
        let animation;
        let duration = 500
        let seed = Math.random() < 0.5 ? -1 : 1
        let ease = "ease"

        switch (state) {
            case -1:
                duration = 500 + Math.random()*50
                animation = [
                    {transform: ""},
                    {transform: `translate(${(15 + Math.random()*10)*seed}px, 0) rotate(${8 + Math.random()*5}deg)`,
                    color: "var(--c-wrong)"},
                    {transform: `translate(0, ${Math.random() * 10 - 5}px)`},
                    {transform: `translate(${(15 + Math.random()*10)*(-seed)}px, 0) rotate(-${8 + Math.random()*5}deg)`},
                    {transform: "", color: "var(--c-wrong)"},
                ]
                break;
            case 1:
                duration = 400
                animation = [
                    {transform: "", color: "var(--c-correct)"},
                    {transform: "scale(1.1)"},
                    {transform: "scale(0.9)"},
                    {transform: "",  color: "var(--c-correct)"},
                ]
                break;
            default:
            case 0:
                duration = 800
                ease = "linear"
                animation = [
                    {transform: "", color: "var(--c-unsure)"},
                    {transform: `scale(1.1)`, borderColor: "var(--c-unsure)"},
                    // {transform: `scale(1.1) rotate(${5*-seed}deg)`},
                    {transform: "", color: "var(--c-unsure)"},
                ]
                break;
        }
        element.animate(animation, {
            duration: duration,
            easing: ease,
            // fill: "forwards",
            iterations: 1
        })
    }
    element.setIndex = (index) => {element.answer_index = index}
    element.setText = (text) => {element.answerText = text}
    element.setLetter = (letter) => {element.answerLetter = letter}
    element.setIndex(params.index)
    element.setText(params.text)
    element.setLetter(params.letter)
    element.render()
    // CMC 12B 2021
})