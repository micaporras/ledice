import React, { useState, useEffect } from 'react';
import '../multiPlayer/Multiplayer.css';
import { IoDiceSharp } from "react-icons/io5";
import Loader from '../../../shared-components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { database } from '../../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import { IoMdExit } from "react-icons/io";
import BoardStatus from '../../../shared-components/BoardStatus/BoardStatus';

const COLORS = ['red', 'green', 'blue', 'orange', 'pink', 'yellow'];

function SinglePlayer() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, color: null, win: false });
    const [boardStatus, setBoardStatus] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const ledRef = ref(database, 'Board');
        const unsubscribe = onValue(ledRef, (snapshot) => {
            const value = snapshot.val();
            setBoardStatus(value === "Off" ? "Off" : "On");
        });
        return () => unsubscribe();
    }, []);

    const getUniqueColors = (arr) => [...new Set(arr)];

    const updateChosenColors = (betsArr) => {
        const uniqueColors = [...new Set(betsArr)];
        set(ref(database, 'chosenColors'), uniqueColors);
    };

    const handleBet = (color) => {
        const uniqueColors = getUniqueColors(bets);
        if (
            bets.length < 3 &&
            (uniqueColors.includes(color) || uniqueColors.length < 3)
        ) {
            const newBets = [...bets, color];
            setBets(newBets);
            set(ref(database, 'singleplayer/bets'), newBets);
            updateChosenColors(newBets); 
        }
    };

    const handleRemoveBet = (color) => {
        const idx = bets.lastIndexOf(color);
        if (idx !== -1) {
            const newBets = [...bets];
            newBets.splice(idx, 1);
            setBets(newBets);
            set(ref(database, 'singleplayer/bets'), newBets);
            updateChosenColors(newBets); 
        }
    };

    const allBetsCompleted = bets.length === 3;

    const renderPlayerIcons = (color) => {
        const count = bets.filter(c => c === color).length;
        return (
            <div className="icon-grid-single">
                {[...Array(count)].map((_, i) => (
                    <span
                        key={i}
                        className="player-icon-single"
                        title="Remove your bet"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveBet(color)}
                    >
                        <img src="/players/single-icon.png" alt="" className='player-icon-img'/>
                    </span>
                ))}
            </div>
        );
    };

    const handleRollDice = () => {
    setLoading(true);

    // Pick a random color
    const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // After 2.5 seconds, save the actual winning color
    setTimeout(async () => {
        await set(ref(database, 'Color'), winningColor.toUpperCase());
    }, 2500);

    // After 6 seconds, show the modal
    setTimeout(() => {
        const uniqueColors = getUniqueColors(bets);
        const win = uniqueColors.includes(winningColor);
        setLoading(false);
        setModal({ show: true, color: winningColor, win });
    }, 6000);
};

    const handlePlayAgain = () => {
        setModal({ show: false, color: null, win: false });
        set(ref(database, 'Color'), 'WHITE');
    };

    const handleEndGame = () => {
        set(ref(database, 'singleplayer/bets'), []);
        set(ref(database, 'Color'), 'WHITE');
        setBets([]);
        setModal({ show: false, color: null, win: false });
        navigate('/colorgame');
    };

    return (
        <>
        {loading && <Loader />}
        <div className="multiplayer">
            <img src="/icons/LEDice1.png" alt="Placeholder" className="multiplayer-image" />
            <h1>Single Player Mode</h1>
            <div className="game-area">
                <div className="player-bet-area add-margin">
                    {bets.length >= 3 && (
                        <div className="bet-completed-text-overlay">Bet Completed</div>
                    )}
                    <span className="player-label"><img src="/players/single-icon.png" alt="" className='player-icon-img'/></span>
                    <div className="bet-colors">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                className={`bet-color ${color}`}
                                onClick={() => handleBet(color)}
                                disabled={bets.length >= 3}
                            />
                        ))}
                    </div>
                </div>
                <div className="game-board">
                    <div className="color-row">
                        <div className="color-box red">{renderPlayerIcons('red')}</div>
                        <div className="color-box orange">{renderPlayerIcons('orange')}</div>
                    </div>
                    <div className="color-row">
                        <div className="color-box green">{renderPlayerIcons('green')}</div>
                        <div className="color-box pink">{renderPlayerIcons('pink')}</div>
                    </div>
                    <div className="color-row">
                        <div className="color-box blue">{renderPlayerIcons('blue')}</div>
                        <div className="color-box yellow">{renderPlayerIcons('yellow')}</div>
                    </div>
                </div>
                {allBetsCompleted && (
                    <div className="roll-dice-area">
                        <button className="roll-dice-btn" onClick={handleRollDice} disabled={loading}>
                            <IoDiceSharp /> Roll Dice
                        </button>
                    </div>
                )}
            </div>
            <div className='exit-game'>
                <button className="exit-game-btn" onClick={handleEndGame}>
                    <IoMdExit />
                </button>
            </div>
            <div>
                <BoardStatus status={boardStatus} />
            </div>
        </div>
        {modal.show && (
            <div className="modal">
                <div className="modal-content">
                    <h2>Result</h2>
                    <div className='winning-color'>
                        <strong>Winning Color:</strong>
                        <span
                            style={{
                                display: 'inline-block',
                                width: 156,
                                height: 156,
                                background: modal.color,
                                marginLeft: 8,
                                verticalAlign: 'middle',
                            }}
                        ></span>
                        <span style={{ marginLeft: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {modal.color}
                        </span>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <strong>{modal.win ? 'You Won' : 'You Lose'}</strong>
                    </div>
                    <div className='modal-buttons'>
                        <button className="modal-play-again-btn" onClick={handlePlayAgain} style={{ marginTop: 24 }}>
                            Play Again
                        </button>
                        <button className="modal-end-btn" onClick={handleEndGame} style={{ marginTop: 24 }}>
                            End Game
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default SinglePlayer