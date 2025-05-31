import React from "react";
import './ColorGame.css';
import { useNavigate } from 'react-router-dom'
import { FaUser } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { RxQuestionMarkCircled } from "react-icons/rx";

function ColorGame() {

    const navigate = useNavigate();

    return (
        <div className="color-game">
            <img src="/icons/LEDice1.png" alt="Placeholder" className="colorgame-image" onClick={() => navigate('/')}/>
            

            <h1>Color Game</h1>
            <div className="colorgame-options">
                <div id="single">
                    <FaUser className="colorgame-single" />
                    <h3>Single Player</h3>
                </div>
                <div id="multi" onClick={() => navigate('/colorgame/multiplayer')}>
                    <FaUsers className="colorgame-multi"/>
                    <h3>Multiplayer</h3>
                </div>
                <div id="howto" onClick={() => navigate('/colorgame/howto')}>
                    <RxQuestionMarkCircled className="colorgame-howto" />
                    <h3>How to Play</h3>
                </div>
            </div>
        </div>
    )
}

export default ColorGame