import React, {useState, useEffect} from "react";
import './ColorGame.css';
import { useNavigate } from 'react-router-dom'
import { FaUser, FaUsers  } from "react-icons/fa";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { database } from "../../firebaseConfig";
import { ref, onValue } from 'firebase/database';
import BoardStatus from "../../shared-components/BoardStatus/BoardStatus";

function ColorGame() {

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
        <div className="color-game">
            <img src="/icons/LEDice1.png" alt="Placeholder" className="colorgame-image" onClick={() => navigate('/')}/>
            

            <h1>Color Game</h1>
            <div className="colorgame-options">
                <div id="single" onClick={() => navigate('/colorgame/singleplayer')}>
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

            <div>
                <BoardStatus status={boardStatus} />
            </div>
        </div>
    )
}

export default ColorGame