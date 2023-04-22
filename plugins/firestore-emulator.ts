import { connectFirestoreEmulator } from '@firebase/firestore';
import { connectAuthEmulator } from '@firebase/auth';
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions';

export default defineNuxtPlugin((nuxt) => {
    const config = useRuntimeConfig();
    const db = useFirestore();
    const auth = useFirebaseAuth();
    const functions = getFunctions();

    if (!config.public.useEmulator) return;
    if (!auth || !db) return;

    console.log('Connecting to the Firestore emulator');
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
});
