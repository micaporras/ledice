import React, { useState, useEffect, useRef } from 'react';
import '../multiPlayer/Multiplayer.css';
import { IoDiceSharp } from "react-icons/io5";
import Loader from '../../../shared-components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { database } from '../../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import { IoMdExit } from "react-icons/io";
import BoardStatus from '../../../shared-components/BoardStatus/BoardStatus';

const COLORS = ['red', 'green', 'blue', 'orange', 'white', 'yellow'];

function SinglePlayer() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, color: null, win: false });
    const [boardStatus, setBoardStatus] = useState("");

    const navigate = useNavigate();
    const audioRef = useRef(null);
    const winSfxRef = useRef(null);
    const loseSfxRef = useRef(null);
    const betSfxRef = useRef(null);
    const removeSfxRef = useRef(null);
    const betCompletedSfxRef = useRef(null);

    useEffect(() => {
        // Autoplay when component mounts
        if (audioRef.current) {
            audioRef.current.volume = 0.2; // Set volume (0.0 to 1.0)
            audioRef.current.play().catch(() => {
                // Autoplay might be blocked; user interaction may be needed
            });
        }
    }, []);

    useEffect(() => {
        if (modal.show) {
            if (modal.win && winSfxRef.current) {
                winSfxRef.current.currentTime = 0;
                winSfxRef.current.play();
            } else if (!modal.win && loseSfxRef.current) {
                loseSfxRef.current.currentTime = 0;
                loseSfxRef.current.play();
            }
        }
    }, [modal.show, modal.win]);

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
        if (betSfxRef.current) {
            betSfxRef.current.currentTime = 0;
            betSfxRef.current.play();
        }
        const uniqueColors = getUniqueColors(bets);
        if (
            bets.length < 3 &&
            (uniqueColors.includes(color) || uniqueColors.length < 3)
        ) {
            const newBets = [...bets, color];
            setBets(newBets);
            set(ref(database, 'singleplayer/bets'), newBets);
            updateChosenColors(newBets); 

            // Play bet completed SFX if this was the 3rd bet
            if (newBets.length === 3 && betCompletedSfxRef.current) {
                betCompletedSfxRef.current.currentTime = 0;
                betCompletedSfxRef.current.play();
            }
        }
    };

    const handleRemoveBet = (color) => {
        if (removeSfxRef.current) {
            removeSfxRef.current.currentTime = 0;
            removeSfxRef.current.play();
        }
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
        set(ref(database, 'Color'), 'RANDOM');
    };

    const handleEndGame = () => {
        set(ref(database, 'singleplayer/bets'), []);
        set(ref(database, 'Color'), 'RANDOM');
        setBets([]);
        set(ref(database, 'chosenColors'), {});
        setModal({ show: false, color: null, win: false });
        navigate('/colorgame');
    };

    return (
        <>
        {loading && <Loader />}
        <div className="multiplayer">
            {/* Background Music */}
            <audio
                ref={audioRef}
                src="/sounds/bg-music.wav"
                loop
                autoPlay
                style={{ display: 'none' }}
            />
            {/* SFX audio elements */}
            <audio ref={winSfxRef} src="/sounds/winner-sfx.mp3" />
            <audio ref={loseSfxRef} src="/sounds/loser-sfx.mp3" />
            <audio ref={betSfxRef} src="/sounds/bet-sfx.wav" />
            <audio ref={removeSfxRef} src="/sounds/remove-sfx.flac" />
            <audio ref={betCompletedSfxRef} src="/sounds/bet-completed-sfx.mp3" />

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
                        <div className="color-box white">{renderPlayerIcons('white')}</div>
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
                    <div style={{ marginTop: 16, marginLeft: 12 }}>
                        <p>{modal.win ? 'You Won' : 'You Lose'}</p>
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