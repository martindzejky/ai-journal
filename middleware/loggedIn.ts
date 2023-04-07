export default defineNuxtRouteMiddleware(async (to) => {
    const user = await getCurrentUser();
    if (user) return;

    return navigateTo({
        path: '/auth',
        query: { redirect: to.fullPath },
    });
});
