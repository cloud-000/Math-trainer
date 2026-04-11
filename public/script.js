async function main() {
    CStorage.init()
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
        "coolcount.js"
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
    app.init()
    app.addTo(document.body)
    app.refresh()

    const supabaseUrl = ENV.DATABASE_URL
    const supabaseKey = ENV.DATABASE_KEY
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

    await checkAuth(supabaseClient)
    if (!CStorage.getItem("logged-in")) {
        app.state = "/auth"
    }
    await app.setClient(supabaseClient)

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
    // TODO: fix to be safe (not local storage)
    return data

}

main()