const macros = {
    "\\sun": "\\odot",
    "\\mbox": "\\text"
}
const delimiters = [
    {left: '$$', right: '$$', display: true},
    {left: '$', right: '$', display: false},
    {left: '\\(', right: '\\)', display: false},
    {left: '\\[', right: '\\]', display: true},
    {left: "\\begin{equation}", right: "\\end{equation}", display: true},
    {left: "\\begin{align}", right: "\\end{align}", display: true}
]
const asyRegex = /\[asy=(.+)\]([\s\S]*?)\[\/asy\]/g

UI.dependencies(["math.css"])
// 'A pyramid whose base is a regular $n$-gon has the same number of edges as a prism whose base is a regular $m$-gon. What is the smallest possible value of $n$?'
UI.register("math-statement", `
<div class="cloud-ui-math-statement-entire-container">
    <div class="cloud-ui-math-statements-parent"></div>
</div>
`, {
    text: 'A pyramid whose base is a regular $n$-gon has the same number of edges as a prism whose base is a regular $m$-gon. What is the smallest possible value of $n$?'
}, (element, params) => {
    element.render = () => {
        let textElement = UI.getChild(element, [0])
        element.trueText = (element.trueText ?? params.text)
        let sections = element.trueText.split(asyRegex)
        let renderNeedElements = []
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].startsWith("https://")) {
                UI.add(textElement,
                    UI.element("img",
                        {"class": "cloud-ui-math cloud-ui-math-image"},
                        {src: sections[i], asyCode: sections[i + 1]}
                    )
                )
                i++ // skip next is asy code
                continue;
            }
            let text = sections[i].trim()
            if (text !== "") {
                text = text.replace(/\[i\](.*?)\[\/i\]/g, '<span style="font-style: italic;">$1</span>');
                let textWrapper = UI.element("div", {
                    "class": "cloud-ui-math cloud-ui-math-statement-wrapper"
                }, {innerHTML: text})
                renderNeedElements.push(textWrapper)
                UI.add(textElement, textWrapper)
            }
        }
        renderNeedElements.forEach(renderNeedElement => {
            renderMathInElement(renderNeedElement,  {
                delimiters,
                macros,
                throwOnError : false,
                errorCallback: () => {
                    console.log("ERROR")
                }
            })
        })
    }
    element.render()
    element.setText = (text, re_render=true) => {
        element.trueText = text
        element.children[0].innerHTML = ""
        if (re_render) {
            element.render()
        }
    }
    // console.trace(element, params);
    // katex.render(params.text, element)
})