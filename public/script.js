const DEBUG = {}
async function main() {
    CStorage.init()
    // CStorage.clear()
    setupTheme()
    await UI.loadComponents([
        "buttons/button.js",
        "icons/icon.js",
        "input/input.js",
        "auth/authUI.js"
    ], "./UI/components/")
    await UI.loadComponents([
        "navbar.js",
        "inputFilter.js",
        "popupMenu.js",
        "range.js",
        "input.js",
        "mathStatement.js",
        "mathProblem.js",
        "UIbar.js",
        "coolcount.js",
        "mathPrevAttempt.js"
    ], "./components/")
    await UI.loadScripts([
        "ManageState.js",
        "SpaPage.js",
        "SpaApp.js",
        "Page404.js",
        "Spa.css"
    ], "./UI/states/")
    await UI.loadScripts([
        "AppPage.js",
        "Home.js",
        "Countdown.js",
        "GrindSheet.js",
        "Search.js",
        "Stats.js",
        "Trainer.js",
        "Settings.js",
        "App.js",
        "style.css",
        "authPage.js"
    ], "./Pages/")

    const app = new App()
    DEBUG.app = app
    app.initCache()
    app.init()
    app.addTo(document.body)
    // app.refresh()

    const supabaseUrl = ENV.DATABASE_URL
    const supabaseKey = ENV.DATABASE_KEY
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)
    // await signOut(supabaseClient)
    // TODO: Must Hide UUID
    await checkAuth(supabaseClient)
    if (!CStorage.getItem("logged-in")) {
        app.state = "/sign-in"
    }
    await app.setClient(supabaseClient)
    app.refresh()

    /*let { data, error } = await supabaseClient
        .from("Problems")
        .select()
        .limit(5)
    console.log(data)*/
}

function setupTheme() {
    Theme.storeTheme(new Theme("plain", {
        "c bg": "rgb(255, 255, 255)",
        "c bg m": "rgb(244, 246, 248)",
        "c text": "rgb(9, 9, 11)",
        "c text2": "rgb(113, 113, 122)",
        "c bd": "rgb(208, 217, 224)",
        "c shadow": "rgb(103 103 120 / 30%)",
        "c accent": "rgb(50, 108, 236)",
        "c accent bg": "rgb(219, 233, 254)"
    }))
    Theme.storeTheme(new Theme("dark", {
        "c bg": "rgb(57 63 75)",
        "c bg m": "rgb(46 51 60)",
        "c text": "rgb(200 204 211)",
        "c text2": "rgb(107 112 124)",
        "c bd": "rgb(54 57 62)",
        "c shadow": "rgb(200 204 211)",
        "c accent": "rgb(64 134 232)",
        "c accent bg": "rgb(169 186 230)"
    }))
    Theme.theme = "plain"
}

// DEV ONLY CStorage
async function checkAuth(sbClient) {
    if (CStorage.getItem("logged-in")) {
        console.log("Logged in saved TODO fix later")
        return CStorage.getItem("logged-in");
    }
    const { data, error } = await sbClient.auth.getClaims()
    if (error || !data?.claims) {
        return error
    }
    CStorage.setItem("logged-in", data.claims)
    console.log(data)
    // TODO: fix to be safe (not local storage)
    return data
}

async function signOut(sbClient) {
    let {error} = await sbClient.auth.signOut({scope: "local"})
}

main()