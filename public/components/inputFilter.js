UI.dependencies(["style.css"])
UI.register("input-tagify", `
<div class="flex expand no-select cloud-ui-tagify-wrapper">
    <div class="flex expand no-select cloud-ui-input-tagify ">
        <div class="flex expand no-select cloud-ui-input-tags">
        
        </div>
        <span 
            role="textbox" 
            contenteditable="plaintext-only"
            aria-multiline="false" 
            class="cloud-ui-tagify-input" 
            data-placeholder="@param(placeholder)"></span>
    </div>
    <div class="cloud-ui-dropdown-wrapper">
        <ul class="cloud-ui-dropdown-list"></ul>
    </div>    
</div>
`, {
    placeholder: "Enter some text here",
    options: ["Choice 1", "Choice 2", "Choice 3", "Awesome", "Github Copilot Vibe Coded this :)"],
}, (element, params) => {
    let container = element
    let inputWrapper = UI.getChild(element, [0])
    let textBox = UI.getChild(inputWrapper, [1])
    let dropdownWrapper = UI.getChild(element, [1])
    let dropdownList = UI.getChild(dropdownWrapper, [0])

    // Store the options passed to component
    let options = params.options
    let tags = []
    /**
     * Filter and display dropdown options based on input
     */
    const updateDropdown = () => {
        const inputValue = textBox.innerText.trim().toLowerCase()
        dropdownList.innerHTML = ""

        if (inputValue.length === 0) {
            showDropdown(options)
            // dropdownWrapper.classList.remove("active")
            return
        }

        // Filter options that match the current input
        const filteredOptions = options.filter(opt =>
            opt.toLowerCase().includes(inputValue)
        )
        if (filteredOptions.length === 0) {
            dropdownWrapper.classList.remove("active")
            return
        }
        showDropdown(filteredOptions)
    }

    function showDropdown(filteredOptions) {
        filteredOptions.forEach(option => {
            const listItem = UI.element("li", {"class": "cloud-ui-dropdown-item"}, {textContent: option})
            // listItem.textContent = option

            listItem.addEventListener("click", () => {
                textBox.innerText =""
                dropdownWrapper.classList.remove("active")
                textBox.focus()
                // Move cursor to end
                const selection = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(textBox)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
                let hasTag = container.hasTag(option)
                element.dispatchEvent(new CustomEvent("value-set", {
                    detail: {value: option, isOption: true, noChange: hasTag},
                    bubbles: false,
                    cancelable: true
                }))
                if (!hasTag) {
                    container.addTag(option)
                }
            })

            listItem.addEventListener("mouseenter", () => {
                document.querySelectorAll(".cloud-ui-dropdown-item.hover").forEach(item => {
                    item.classList.remove("hover")
                })
                listItem.classList.add("hover")
            })

            dropdownList.appendChild(listItem)
        })
        dropdownWrapper.classList.add("active")
        dropdownWrapper.style.setProperty("width", element.offsetWidth + "px")
        dropdownWrapper.style.setProperty("top", element.offsetHeight + "px")
        /*UI.setAttributes(dropdownWrapper, {
            "width": element.offsetWidth + "px",
            // "top": element.offsetHeight + "px"
        })*/
    }

    container.hasTag = (tag) => {
        return tags.includes(tag)
    }

    container.addTag = (tag) => {
        UI.add(container, UI.component("tagify-tag", {title: tag}, {}, {cloudParent: container}), [0, 0, 0])
        tags.push(tag)
    }

    /**
     * Set filter options
     */
    container.setOptions = (o) => {
        options = o
        updateDropdown()
    }

    container.addChoice = (o) => {
        options.push(o)
        updateDropdown()
    }

    /**
     * Get current input value
     */
    container.getValue = () => {
        return textBox.innerText.trim()
    }

    /**
     * Clear input
     */
    container.clear = () => {
        textBox.innerText = ""
        dropdownWrapper.classList.remove("active")
    }

    container.destroyTag = (name) => {
        let i = tags.indexOf(name)
        if (i > -1) {
            tags.splice(i, 1)
        }
    }

    container.getTags = () => {return tags}

    // Event listeners
    textBox.addEventListener("keydown", (ev) => {
        const items = dropdownList.querySelectorAll(".cloud-ui-dropdown-item")
        const hoveredItem = dropdownList.querySelector(".cloud-ui-dropdown-item.hover")

        if (ev.key === "Enter") {
            ev.preventDefault()
            if (hoveredItem) {
                hoveredItem.click()
            } else {
                element.dispatchEvent(new CustomEvent("value-set", {
                    detail: {value: textBox.innerText, isOption: options.includes(textBox.innerText), noChange: container.hasTag(textBox.innerText) } ,
                    bubbles: false,
                    cancelable: true
                }))
            }
        } else if (ev.key === "ArrowDown") {
            ev.preventDefault()
            if (items.length === 0) return
            if (!hoveredItem) {
                items[0].classList.add("hover")
            } else {
                const currentIndex = Array.from(items).indexOf(hoveredItem)
                if (currentIndex < items.length - 1) {
                    hoveredItem.classList.remove("hover")
                    items[currentIndex + 1].classList.add("hover")
                }
            }
            hoveredItem?.scrollIntoView({ behavior: "smooth" })
        } else if (ev.key === "ArrowUp") {
            ev.preventDefault()
            if (items.length === 0) return
            if (!hoveredItem) {
                items[items.length - 1].classList.add("hover")
            } else {
                const currentIndex = Array.from(items).indexOf(hoveredItem)
                if (currentIndex > 0) {
                    hoveredItem.classList.remove("hover")
                    items[currentIndex - 1].classList.add("hover")
                }
            }
            hoveredItem?.scrollIntoView({ behavior: "smooth" })
        } else if (ev.key === "Escape") {
            dropdownWrapper.classList.remove("active")
        }
    })

    textBox.addEventListener("input", () => {
        if (textBox.innerText.trim() === "") {
            textBox.innerHTML = ""
            updateDropdown()
            // dropdownWrapper.classList.remove("active")
        } else {
            updateDropdown()
        }
    })

    textBox.addEventListener("paste", (e) => {
        e.preventDefault()
        const text = (e.clipboardData || window.clipboardData).getData('text')
        const singleLineText = text.replace(/[\r\n]+/g, ' ')

        const selection = window.getSelection()
        if (!selection.rangeCount) return
        selection.deleteFromDocument()

        const textNode = document.createTextNode(singleLineText)
        selection.getRangeAt(0).insertNode(textNode)
        selection.collapseToEnd()

        updateDropdown()
    })

    textBox.addEventListener("focus", () => {
        updateDropdown()
    })

    textBox.addEventListener("blur", () => {
        // Delay closing to allow click on dropdown item
        setTimeout(() => {
            // if (!dropdownWrapper.querySelector(".cloud-ui-dropdown-item:hover")) {
            dropdownWrapper.classList.remove("active")
            // }
        }, 120)
    })

    // Close dropdown when clicking outside
    /*document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            dropdownWrapper.classList.remove("active")
        }
    })*/
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
}, (element, params) => {
    UI.getChild(element, [1]).onclick = () => {
        element.remove()
        element.cloudParent.destroyTag(params.title)
    }
})