<script lang="ts">
    import Icon from "./icon.svelte";
    let {
        text = "Hello World",
        icon = "Home",
        href = "",
        variant = "",
        active = false,
        mobileHelp = false,
    } = $props();
</script>

<a
    {href}
    class={["no-select flex button", variant, { "mobile-support": mobileHelp }]}
    {...active ? { "data-active": true } : {}}
>
    {#if icon}
        <Icon text={icon} --fill={active ? "1" : "0"} />
    {/if}
    {#if text}
        <span>{text}</span>
    {/if}
</a>

<style>
    a {
        appearance: none;
        text-decoration: none;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
    }
    .button {
        flex-direction: row;
        appearance: none;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        font-size: var(--text-size);
        color: var(--c-text);
        background-color: transparent;
        border: var(--bd-size) solid var(--c-bd);
        border-radius: var(--bd-r);
        box-sizing: border-box;
        padding: 8px 16px;
        gap: 8px;
        white-space: nowrap;
        box-sizing: border-box;
    }
    .nav {
        border: none;
        transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
        &:hover {
            background-color: var(--c-bg-m);
        }
        &[data-active] {
            color: var(--c-accent);
            background-color: var(--c-accent-bg);
        }
    }
    @scope (.mobile) {
        .mobile-support {
            flex-direction: column;
        }
    }
</style>
