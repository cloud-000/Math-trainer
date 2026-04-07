async function main() {
    CStorage.init()
    setupTheme()
    await UI.loadComponents([
        "buttons/button.js",
        "icons/icon.js"
    ], "./UI/components/")
    await UI.loadComponents([
        "navbar.js",
        "inputFilter.js",
        "popupMenu.js",
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
        "App.js"
    ], "./Pages/")

    const app = new App()
    app.init()
    app.addTo(document.body)
    app.refresh()

    const supabaseUrl = "https://fpuslidghwkkcvollbln.supabase.co"
    const supabaseKey = "sb_publishable_gDidjPsWR4Eo482cS5VgCw_N9vckEMr"
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

    await checkAuth(supabaseClient)
    app.signIn(supabaseClient)
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
        console.log("Logged in")
        return;
    }
    const { data, error } = await sbClient.auth.getClaims()
    if (error || !data?.claims) {
        console.log("Login Failed")
        return
    }
    CStorage.setItem("logged-in", "true")
    console.log(data)

}

main()