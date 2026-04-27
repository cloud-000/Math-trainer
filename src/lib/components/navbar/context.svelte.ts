// context.svelte.ts
import { getContext, setContext } from "svelte";

type NavbarState = "open" | "closed" | "collapsed";

class NavbarService {
    state = $state<NavbarState>("open");

    toggle() {
        if (this.state === "open") this.state = "collapsed";
        else if (this.state === "collapsed") this.state = "closed";
        else this.state = "open";
    }
}

const KEY = Symbol("sidebar");

export function setNavbar() {
    return setContext(KEY, new NavbarService());
}

export function useNavbar() {
    return getContext<NavbarService>(KEY);
}
