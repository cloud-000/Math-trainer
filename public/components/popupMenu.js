UI.dependencies(["popupMenu.css"])

UI.register("popup-menu", `
<div class="cloud-ui-popup-menu">
    <ul class="cloud-ui-menu-list"></ul>
</div>
`, {}, (element, params) => {
    let menuElement = element
    let menuList = UI.getChild(element, [0])
    let menuItems = params.items ?? []
    let isOpen = false

    /**
     * Calculate optimal position to keep menu within viewport
     * @param {number} x - Desired X position
     * @param {number} y - Desired Y position
     * @param {number} width - Element width
     * @param {number} height - Element height
     * @returns {Object} {x, y} adjusted position
     */
    const adjustPositionForViewport = (x, y, width, height) => {
        let adjustedX = x
        let adjustedY = y

        // Check if menu goes beyond right edge
        if (x + width > window.innerWidth) {
            adjustedX = window.innerWidth - width - 10
        }

        // Check if menu goes beyond bottom edge
        if (y + height > window.innerHeight) {
            adjustedY = window.innerHeight - height - 10
        }

        // Check if menu goes beyond left edge
        if (adjustedX < 10) {
            adjustedX = 10
        }

        // Check if menu goes beyond top edge
        if (adjustedY < 10) {
            adjustedY = 10
        }

        return { x: adjustedX, y: adjustedY }
    }

    /**
     * Position submenu based on parent element bounds
     * @param {HTMLElement} submenuWrapper - The submenu wrapper element
     * @param {HTMLElement} parentItem - The parent menu item
     */
    const positionSubmenu = (submenuWrapper, parentItem) => {
        const submenuList = submenuWrapper.querySelector(".cloud-ui-submenu-list")
        if (!submenuList) return

        // Temporarily show to measure
        submenuWrapper.classList.add("measuring")

        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
            const parentRect = parentItem.getBoundingClientRect()
            const submenuRect = submenuList.getBoundingClientRect()

            submenuWrapper.classList.remove("measuring")

            // Determine if we should flip left
            // Check if submenu would go beyond right edge when positioned on the right
            const wouldGoRight = (parentRect.right + submenuRect.width) > (window.innerWidth - 10)
            const wouldFitLeft = (parentRect.left - submenuRect.width) >= 10

            if (wouldGoRight && wouldFitLeft) {
                submenuWrapper.classList.add("left")
            } else {
                submenuWrapper.classList.remove("left")
            }

            // Determine if we should flip top
            // Check if submenu would go beyond bottom edge when positioned at bottom
            const wouldGoBottom = (parentRect.bottom + submenuRect.height) > (window.innerHeight - 10)
            const wouldFitTop = (parentRect.top - submenuRect.height) >= 10

            if (wouldGoBottom && wouldFitTop) {
                submenuWrapper.classList.add("top")
            } else {
                submenuWrapper.classList.remove("top")
            }
        })
    }

    /**
     * Build menu items recursively
     * @param {Array} items - Array of menu items
     * @param {HTMLElement} parentList - Parent UL element to append to
     */
    const buildMenuItems = (items, parentList) => {
        items.forEach((item, index) => {
            const listItem = document.createElement("li")
            listItem.className = "cloud-ui-menu-item"

            const itemContent = document.createElement("div")
            itemContent.className = "cloud-ui-menu-item-content"
            itemContent.textContent = item.text

            listItem.appendChild(itemContent)

            // If item has submenu
            if (item.items && item.items.length > 0) {
                itemContent.classList.add("has-submenu")

                const arrow = document.createElement("span")
                arrow.className = "cloud-ui-menu-arrow"
                arrow.textContent = "›"
                itemContent.appendChild(arrow)

                const submenuWrapper = document.createElement("div")
                submenuWrapper.className = "cloud-ui-submenu-wrapper"

                const submenuList = document.createElement("ul")
                submenuList.className = "cloud-ui-submenu-list"

                buildMenuItems(item.items, submenuList)
                submenuWrapper.appendChild(submenuList)
                listItem.appendChild(submenuWrapper)

                // Submenu hover handling - only affect this specific submenu
                listItem.addEventListener("mouseenter", () => {
                    // Remove active class from other items at this level only
                    const parentMenu = listItem.parentElement
                    parentMenu.querySelectorAll(":scope > .cloud-ui-menu-item.active").forEach(el => {
                        if (el !== listItem) {
                            el.classList.remove("active")
                        }
                    })

                    listItem.classList.add("active")
                    positionSubmenu(submenuWrapper, listItem)
                })

                listItem.addEventListener("mouseleave", () => {
                    listItem.classList.remove("active")
                })
            } else if (item.onclick) {
                // If item has onclick handler
                itemContent.style.cursor = "pointer"
                itemContent.addEventListener("click", (e) => {
                    e.stopPropagation()
                    item.onclick()
                    if (item.close !== false) {
                        menuElement.close()
                    }
                })
            }

            parentList.appendChild(listItem)
        })
    }

    if (menuItems.length > 0) {
        buildMenuItems(menuItems, menuList)
    }

    /**
     * Open the popup menu at specified coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    menuElement.open = (x, y) => {
        if (!menuItems.length) return

        menuElement.style.position = "fixed"
        menuElement.style.left = x + "px"
        menuElement.style.top = y + "px"
        menuElement.classList.add("active")
        isOpen = true

        // Allow DOM to render, then adjust position
        requestAnimationFrame(() => {
            const width = menuElement.offsetWidth
            const height = menuElement.offsetHeight
            const adjusted = adjustPositionForViewport(x, y, width, height)
            menuElement.style.left = adjusted.x + "px"
            menuElement.style.top = adjusted.y + "px"
        })

        // Close menu when clicking outside
        const closeOnClickOutside = (e) => {
            if (!menuElement.contains(e.target)) {
                menuElement.close()
            }
        }

        document.addEventListener("click", closeOnClickOutside)
        menuElement._closeListener = closeOnClickOutside

        // Close on Escape key
        const closeOnEscape = (e) => {
            if (e.key === "Escape") {
                menuElement.close()
            }
        }

        document.addEventListener("keydown", closeOnEscape)
        menuElement._escapeListener = closeOnEscape
    }

    /**
     * Close the popup menu
     */
    menuElement.close = () => {
        menuElement.classList.remove("active")
        isOpen = false

        if (menuElement._closeListener) {
            document.removeEventListener("click", menuElement._closeListener)
            menuElement._closeListener = null
        }

        if (menuElement._escapeListener) {
            document.removeEventListener("keydown", menuElement._escapeListener)
            menuElement._escapeListener = null
        }
    }

    /**
     * Set menu items and rebuild the menu
     * @param {Array} items - Array of menu items with structure: [{text: "...", onclick: () => {}}, {text: "...", items: [...]}]
     */
    menuElement.setItems = (items) => {
        menuItems = items
        menuList.innerHTML = ""
        buildMenuItems(items, menuList)
    }

    /**
     * Check if menu is currently open
     * @returns {boolean}
     */
    menuElement.isOpen = () => isOpen

    /**
     * Toggle menu visibility
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    menuElement.toggle = (x, y) => {
        if (isOpen) {
            menuElement.close()
        } else {
            menuElement.open(x, y)
        }
    }
})

UI.register("popup-menu-item", `
<li class="cloud-ui-menu-item">
    <div class="cloud-ui-menu-item-content">@param(text)</div>
</li>
`, {
    text: "Menu Item"
})