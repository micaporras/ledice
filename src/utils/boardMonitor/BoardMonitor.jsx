import { useEffect, useState } from 'react';
import { database } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';

export function BoardMonitor() {
    const [randomNumber, setRandomNumber] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    useEffect(() => {
        // Reference to the RandomNumber field in Firebase
        const randomNumberRef = ref(database, "/RandomNumber");

        // Monitor changes to RandomNumber
        onValue(randomNumberRef, (snapshot) => {
            const value = snapshot.val();
            setRandomNumber(value);
            setLastUpdated(Date.now());
            // Set Board to "On" if it's not already
            set(ref(database, "/Board"), "On");
        });
    }, [database]);

    useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - lastUpdated > 10000) {
            // If no change for 10 seconds, set Board to "Off"
            set(ref(database, "/Board"), "Off");
        }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdated, database]);
}