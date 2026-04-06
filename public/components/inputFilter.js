UI.dependencies(["style.css"])
UI.register("input-tagify", `
<div class="flex expand no-select cloud-ui-input-tagify ">
    <span 
        role="textbox" 
        contenteditable="plaintext-only"
        aria-multiline="false" 
        class="cloud-ui-tagify-input" 
        data-placeholder="@param(prompt)"></span>
</div>
`, {
    prompt: "Enter some text here"
}, (element) => {
    let textBox = UI.getChild(element, [0])
    textBox.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault()
        }
    })
    textBox.addEventListener("input", () => {
        if (textBox.innerText.trim() === "") {
            textBox.innerHTML = ""
        }
    })
    textBox.addEventListener("paste", (e) => {
        e.preventDefault();
        // 1. Get and clean the text
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const singleLineText = text.replace(/[\r\n]+/g, ' ');

        // 2. Get the current cursor position (Selection)
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        selection.deleteFromDocument(); // Removes any highlighted text

        // 3. Create a text node and insert it
        const textNode = document.createTextNode(singleLineText);
        selection.getRangeAt(0).insertNode(textNode);

        // 4. Move the cursor to the end of the newly inserted text
        selection.collapseToEnd();

    });

})

UI.register("tagify-tag", `
<div class="flex expand cloud-ui-tagify-tag">
    <div>@param(title)</div>
    <span class="cloud-ui-tagify-remove">
        x
    </span>
</div>
`, {
    title: "Sigh"
})