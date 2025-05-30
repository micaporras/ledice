import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'
import { database } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';

function LandingPage() {

    const navigate = useNavigate();
    const [ledStatus, setLedStatus] = useState("OFF");

    useEffect(() => {
        const ledRef = ref(database, 'LED');
        const unsubscribe = onValue(ledRef, (snapshot) => {
            const value = snapshot.val();
            setLedStatus(value === "ON" ? "ON" : "OFF");
        });
        return () => unsubscribe();
    }, []);

    const toggleLed = () => {
    const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PINK", "ORANGE"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const colorRef = ref(database, 'Color');
    set(colorRef, randomColor);
    };

    return (
        <div className='landing-page'>
            <img src="/icons/LEDice1.png" alt="Placeholder" className="landing-image" />
            <div className='landing-text'>
                <h2>What do you want to play?</h2>
            </div>
            <div className='landing-options'>
                <div className='option' onClick={() => navigate('/colorgame')}>
                    <img src='/icons/colorgame-icon.png'/>
                    <h3>Color Game</h3>
                </div>
                <div className='option' onClick={() => navigate('/colormixer')}>
                    <img src='/icons/colormixer-icon.png'/>
                    <h3>Color Mixer</h3>
                </div>
            </div>
            <div>
                <div className='option' onClick={toggleLed}>
                    <h3>Roll</h3>
                </div>
            </div>
            
        </div>
    )
}

export default LandingPage