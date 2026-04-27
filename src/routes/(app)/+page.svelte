<script>
    let { data } = $props();
    console.log("Hello from app/");
    (async () => {
        console.log(await data.data.user?.username);
    })();
</script>

<h1 class="no-select">
    Welcome {#await data.data.user?.username then name}
        <span>{name.data[0].username}</span>
    {/await}
</h1>
<p>Your stats</p>
