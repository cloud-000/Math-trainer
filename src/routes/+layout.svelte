<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import "$lib/global.css";
    import { onMount } from "svelte";
    import { deviceDetails } from "$lib/deviceDetails.svelte";
    import { Theme } from "$lib/utils/Theme";
    // import {PUBLIC_TEST_EMAIL, PUBLIC_TEST_PASSWORD} from "$env/static/public"
    import {
        PUBLIC_TEST_EMAIL,
        PUBLIC_TEST_PASSWORD,
    } from "$env/static/public";
    // import { setUserSession } from "$lib/user.svelte";

    let { data: pData, children } = $props();

    console.log("Hello from +layout.svelte");
    if (!pData.data.user) {
        console.log("Not Signed In");
        (async () => {
            let { data } = await pData.supabase.auth.signInWithPassword({
                email: PUBLIC_TEST_EMAIL,
                password: PUBLIC_TEST_PASSWORD,
            });
            console.log(data);
            console.log("HIII");
        })();
    }

    onMount(() => {
        console.log(`This should only run once ${Date.now()}`);
        Theme.init();
        Theme.storeTheme(
            new Theme("plain", {
                "c bg": "rgb(255, 255, 255)",
                "c bg m": "rgb(244, 246, 248)",
                "c text": "rgb(9, 9, 11)",
                "c text2": "rgb(113, 113, 122)",
                "c bd": "rgb(208, 217, 224)",
                "c shadow": "rgb(103 103 120 / 30%)",
                "c accent": "rgb(50, 108, 236)",
                "c accent bg": "rgb(219, 233, 254)",
            }),
        );
        Theme.storeTheme(
            new Theme("dark", {
                "c bg": "rgb(57 63 75)",
                "c bg m": "rgb(46 51 60)",
                "c text": "rgb(200 204 211)",
                "c text2": "rgb(107 112 124)",
                "c bd": "rgb(54 57 62)",
                "c shadow": "rgb(200 204 211)",
                "c accent": "rgb(64 134 232)",
                "c accent bg": "rgb(169 186 230)",
            }),
        );
        Theme.theme = "plain";
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<main class="expand flex {deviceDetails.isMobile ? 'mobile' : ''}">
    {@render children()}
</main>

<style>
    @media (orientation: portrait) {
        main.mobile {
            flex-direction: column-reverse;
        }
    }
    main {
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        overflow: hidden;
    }
</style>
