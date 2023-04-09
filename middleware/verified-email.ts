import { User } from '@firebase/auth';

export default defineNuxtRouteMiddleware(async (to) => {
    const user = (await getCurrentUser()) as User | null;
    if (!user) return;
    if (user.emailVerified) return;

    return navigateTo({
        path: '/verify-email',
        query: { redirect: to.fullPath },
    });
});
