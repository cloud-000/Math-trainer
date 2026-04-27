<script lang="ts">
    let { children } = $props();
</script>

<div class="flex navbar-edge">
    {@render children()}
</div>

<style>
    .navbar-edge {
        width: 100%;
    }
</style>
