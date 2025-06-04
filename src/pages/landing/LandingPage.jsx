import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'
import { database } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import BoardStatus from '../../shared-components/BoardStatus/BoardStatus';

function LandingPage() {

    const navigate = useNavigate();
    const [boardStatus, setBoardStatus] = useState("");

    useEffect(() => {
        const ledRef = ref(database, 'Board');
        const unsubscribe = onValue(ledRef, (snapshot) => {
            const value = snapshot.val();
            setBoardStatus(value === "Off" ? "Off" : "On");
        });
        return () => unsubscribe();
    }, []);


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
                <BoardStatus status={boardStatus} />
            </div>
            
        </div>
    )
}

export default LandingPage