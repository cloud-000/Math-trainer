class UI{
    static c={};
    static l={};
    // ex: UI.element("div", {style: "background-color: green; font-size: 50px;"}, {textContent: "Hello World?"})
    static element(t,s={},r={}) {
        let i=document.createElement(t);
        return UI.setAttributes(i,s),UI.setOtherAttrs(i,r),i
    }
    // HTML attributes
    // ex: UI.setAttributes(HTMLElement, {style: "color: red;"})
    static setAttributes(t,s) {
        Object.keys(s).forEach(r=>t.setAttribute(r,s[r]))
    }
    // JS attributes
    static setOtherAttrs(t,s) {
        Object.keys(s).forEach(r=>t[r]=s[r])
    }
    // Generate HTML from raw HTML strings
    static rawHTML(t) {
        let s=UI.element("div");return s.innerHTML=t,s.children[0]
    }
}

// Create Component
/**
 * @param{string} name
 * @param params
 * @param{Object} htmlProps
 * @param{Object} jsProps
 * @returns {HTMLElement}
 */
UI.component = (name, params={}, htmlProps={}, jsProps={}) => {
    let finalParams = Object.assign({}, UI.c[name].parameters ?? {}, params)
    let e = UI.compose(UI.c[name], finalParams)
    finalParams = null
    UI.setAttributes(e, htmlProps)
    UI.setOtherAttrs(e, jsProps)
    return e
}

// Register Component (Children supported and will be cloned). ex: UI.register("my-cool-component-yeah", htmlElement)
/**
 * @param{string} name - id of element
 * @param{HTMLElement|string} element - HTML element
 * @param{Object} params
 * @param{Function?} onReady
 */
UI.register = (name, element, params={}, onReady=null) => {
    UI.c[name] = UI.decompose(
        (typeof element === "string" ?
            UI.rawHTML(element.trim()) : element),
        params || {},
        onReady
    )
}

/**
 * Decomposes HTMLElement
 * @param{HTMLElement} e
 * @param{Object?} params
 * @param onReady
 */
UI.decompose = (e, params=null, onReady=null) => {
    if (e.children.length === 0) {
        return {
            element: e.cloneNode(),
            childs: false,
            text: e.textContent,
            parameters: params,
            onReady: onReady
        }
    }
    return {
        element: e.cloneNode(),
        childs: Array.from(e.children).map((c) => {return UI.decompose(c)}),
        parameters: params,
        onReady: onReady
    }
}
/**
 * @returns {HTMLElement}
 */
UI.compose = (l, params={}) => {
    let e = l.element.cloneNode()
    for (let a of e.attributes) {
        e.setAttribute(replaceWithParams(a.name, params), replaceWithParams(a.value, params))
    }
    if (l.text) {
        e.textContent = replaceWithParams(l.text, params)
    }
    if (l.childs) {
        l.childs.forEach(c => e.appendChild(UI.compose(c, params)))
    }
    if (l.onReady) {
        l.onReady.call(null, e)
    }
    return e
}

function replaceWithParams(text, params) {
    return text.replaceAll(/@param\((.+?)\)/g, (_, key) => {return params[key] ?? ""})
}

/**
 * Add child to parent
 * @param{HTMLElement} parent
 * @param{HTMLElement} child
 * @param{number} index
 * */
UI.add = (parent, child, index=parent.children.length) => {
    if (index >= parent.children.length) {
        parent.appendChild(child)
    } else {
        parent.insertBefore(child, parent.children[index])
    }
}

/**
 * @param{string} query
 * @param{HTMLElement | Document} doc
 * @returns {HTMLElement}
 */
UI.get = (query, doc=document) => {
    return doc.querySelector(query)
}

UI.getChild = (element, indices) => {
    let prev = element
    for (let index of indices) {
        prev = prev.children[index]
    }
    return prev
}

// ----- LOADING ------
const LOADING_CONFIG = {added: []}

function getLoadPath(path) {return LOADING_CONFIG["prefix"] + path}

// For inside library use only
UI.dependencies = async (otherFiles) => {
    if (!otherFiles) {return}
    for (const file of otherFiles) {
        let path = getLoadPath(LOADING_CONFIG["current"] + file)
        if (LOADING_CONFIG.added.includes(path)) {
            continue
        }
        LOADING_CONFIG.added.push(path)
        await _loadStylesheet(path, LOADING_CONFIG["element"])
    }
}

/**
 * @param{string[]} components
 * @param{string} prefix
 */
UI.loadComponents = async (components, prefix="./UI/components/") => {
    // let startTime = performance.now()
    LOADING_CONFIG["prefix"] = prefix
    let parent =
        UI.get("#cloud-ui-component-load") ||
        UI.element("div", {id: "#cloud-ui-component-load"});
    UI.add(document.head, parent)
    LOADING_CONFIG["element"] = parent
    for (let c of components) {
        LOADING_CONFIG["current"] = c.replace(/[^\/]*$/, "")
        await _loadScript(getLoadPath(c), parent);
    }
    // console.log(`Cloud UI loaded in ${(performance.now() - startTime).toFixed(2)} ms`)
}

UI.loadScripts = async (files, prefix="./UI/states/", parent=document.head) => {
    let startTime = performance.now()
    for (let f of files) {
        let matches = f.match(/.+?\.([a-zA-Z]+)$/)
        if (matches[1] === "css") {
            await _loadStylesheet(prefix + f, parent)
        } else {
            await _loadScript(prefix + f, parent);
        }
    }
    return performance.now() - startTime
}

/**
 * Loads script into document head
 * @param{string} s
 * @param{HTMLElement} parent
 * @return{Promise}
 */
function _loadScript(s, parent=document.head) {
    return new Promise((resolve, reject) => {
        let script = UI.element("script", {defer: "true", src: s})
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${s}`));
        parent.appendChild(script)
    })
}

async function _loadStylesheet(s, parent=document.head) {
    let style = UI.element("link", {rel: "stylesheet", type: "text/css", href: s})
    parent.appendChild(style)
}

UI.wait = (element) => {
    return new Promise((resolve, reject) => {
        // If already loaded (e.g., cached image), resolve immediately
        if (element.complete) return resolve(element);

        element.addEventListener("load", () => resolve(element));
        element.addEventListener("error", (err) => reject(err));
    });
}
