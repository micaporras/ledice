import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'
import { database } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { IoCloseCircleSharp } from "react-icons/io5";

function LandingPage() {

    const navigate = useNavigate();
    const [boardStatus, setBoardStatus] = useState("Off");

    useEffect(() => {
        const ledRef = ref(database, 'Board');
        const unsubscribe = onValue(ledRef, (snapshot) => {
            const value = snapshot.val();
            setBoardStatus(value === "Off" ? "Off" : "On");
        });
        return () => unsubscribe();
    }, []);

    const toggleLed = () => {
    const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PINK", "ORANGE"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const colorRef = ref(database, 'Color');
    set(colorRef, randomColor);
    };

    const boardStatusClass = boardStatus === "On" ? "Connected" : "Disconnected";

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
            {/* <div>
                <div className='option' onClick={toggleLed}>
                    <h3>Roll</h3>
                </div>
            </div> */}

            <div>
                <div className={`board-status ${boardStatus === "On" ? "connected" : "disconnected"}`}>
                    {boardStatus === "On" ? <IoCheckmarkCircleSharp /> : <IoCloseCircleSharp />}
                    <p>Board {boardStatusClass}</p>
                </div>
            </div>
            
        </div>
    )
}

export default LandingPage