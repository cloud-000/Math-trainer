import type { LayoutServerLoad } from "./$types";
export const load: LayoutServerLoad = async ({
    locals: { getUser },
    cookies,
}) => {
    const { user } = await getUser(true);
    return {
        // session,
        user,
        cookies: cookies.getAll(),
    };
};
