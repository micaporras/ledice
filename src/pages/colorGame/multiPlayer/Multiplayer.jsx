import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './Multiplayer.css';
import { IoDiceSharp } from "react-icons/io5";
import { database } from '../../../firebaseConfig';
import { ref, set, onValue, get } from 'firebase/database';
import Loader from '../../../shared-components/Loader/Loader';
import { IoMdExit } from "react-icons/io";
import BoardStatus from '../../../shared-components/BoardStatus/BoardStatus';


const COLORS = ['red', 'green', 'blue', 'orange', 'pink', 'yellow'];
const COLOR_LABELS = ['Red', 'Green', 'Blue', 'Orange', 'Pink', 'Yellow'];

function Multiplayer() {

    const [numPlayers, setNumPlayers] = useState(null);
    const [bets, setBets] = useState({});
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, color: null, winners: [] });
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

    // Load from Firebase on mount
    useEffect(() => {
        const numPlayersRef = ref(database, 'multiplayer/numPlayers');
        const betsRef = ref(database, 'multiplayer/bets');

        const unsubNumPlayers = onValue(numPlayersRef, (snap) => {
            const val = snap.val();
            setNumPlayers(val ? Number(val) : null); // <-- always a number or null
        });
        const unsubBets = onValue(betsRef, (snap) => {
            setBets(snap.val() || {});
        });

        return () => {
            unsubNumPlayers();
            unsubBets();
        };
    }, []);

    // Save numPlayers to Firebase
    const handleSetNumPlayers = (n) => {
        set(ref(database, 'multiplayer/numPlayers'), n);
    };

    const getUniqueColors = (arr) => [...new Set(arr)];

    const updateOverallColors = (betsObj) => {
        // Collect all bets from all players
        const allBets = Object.values(betsObj)
            .flatMap(player => player?.bets || []);
        // Get unique colors
        const uniqueColors = [...new Set(allBets)];
        // Save to database
        set(ref(database, 'chosenColors'), uniqueColors);
    };

    // Handle placing a bet for a player
    const handleBet = (player, color) => {
        setBets(prev => {
            const playerBets = prev[player]?.bets || [];
            const uniqueColors = getUniqueColors(playerBets);
            // Only allow up to 3 bets and up to 3 unique colors
            if (
                playerBets.length < 3 &&
                (uniqueColors.includes(color) || uniqueColors.length < 3)
            ) {
                const newPlayerBets = [...playerBets, color];
                const newUniqueColors = getUniqueColors(newPlayerBets);
                const newBets = {
                    ...prev,
                    [player]: {
                        bets: newPlayerBets,
                        colors: newUniqueColors
                    }
                };
                set(ref(database, `multiplayer/bets/${player}`), { bets: newPlayerBets, colors: newUniqueColors });
                updateOverallColors(newBets);
                return newBets;
            }
            return prev;
        });
    };

    // Remove the last bet of a player for a color
    const handleRemoveBet = (player, color) => {
        setBets(prev => {
            const playerBets = (prev[player]?.bets) || [];
            const idx = playerBets.lastIndexOf(color);
            if (idx !== -1) {
                const newPlayerBets = [...playerBets];
                newPlayerBets.splice(idx, 1);
                const uniqueColors = getUniqueColors(newPlayerBets);
                const updated = { 
                    ...prev, 
                    [player]: { 
                        bets: newPlayerBets, 
                        colors: uniqueColors 
                    } 
                };
                set(ref(database, `multiplayer/bets/${player}`), { bets: newPlayerBets, colors: uniqueColors });
                updateOverallColors(updated);
                return updated;
            }
            return prev;
        });
    };

    // Render player icons in color boxes
    const renderPlayerIcons = (color) => {
        let icons = [];
        for (let player = 1; player <= numPlayers; player++) {
            const playerBets = bets[player]?.bets || [];
            const count = playerBets.filter(c => c === color).length;
            for (let i = 0; i < count; i++) {
                icons.push({ player, key: `${player}-${i}` });
            }
        }

        // Fill up to 12 slots for the 4x3 grid
        while (icons.length < 12) {
            icons.push(null);
        }

        // Grid positions: center first (slot 5), then spiral out (custom order for 3x4)
        const gridOrder = [5, 6, 1, 4, 8, 9, 2, 7, 10, 0, 3, 11];

        return (
            <div className="icon-grid">
                {gridOrder.map((pos, idx) =>
                    icons[idx] ? (
                        <span
                            key={icons[idx].key}
                            className={`player-icon player-${icons[idx].player}`}
                            title={`Remove Player ${icons[idx].player}'s bet`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRemoveBet(icons[idx].player, color)}
                        >
                            <img
                                src={`/players/player${icons[idx].player}-icon.png`}
                                alt={`Player ${icons[idx].player}`}
                                className="player-icon-img"
                            />
                        </span>
                    ) : (
                        <span key={pos} className="icon-placeholder"></span>
                    )
                )}
            </div>
        );
    };

    // Check if all players have completed their bets
    const allBetsCompleted =
    numPlayers &&
    Array.from({ length: numPlayers }, (_, i) => i + 1)
        .every(playerNum => (bets[playerNum]?.bets || []).length === 3);

    
    // Roll Dice logic
    const handleRollDice = async () => {
        setLoading(true);

        // Pick a random color
        const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)];

        /// After 2.5 seconds, save the winning color to the database
        setTimeout(async () => {
            await set(ref(database, 'Color'), winningColor.toUpperCase());
        }, 2500);

        // After 6 seconds before showing the modal
        setTimeout(async () => {
            // Read bets from database to get the latest colors for each player
            const betsSnap = await get(ref(database, 'multiplayer/bets'));
            const betsData = betsSnap.val() || {};

            // Find winners
            const winners = [];
            for (let player = 1; player <= numPlayers; player++) {
                const playerColors = betsData[player]?.colors || [];
                if (playerColors.includes(winningColor)) {
                    winners.push(player);
                }
            }

            setLoading(false);
            setModal({ show: true, color: winningColor, winners });
        }, 6000);
    };

    const handlePlayAgain = async () => {
    // Clear bets in database and local state
    setModal({ show: false, color: null, winners: [] });
    set(ref(database, 'Color'), 'WHITE')
    };

    const handleEndGame = async () => {
        // Reset numPlayers and bets in database and local state
        await set(ref(database, 'multiplayer/numPlayers'), null);
        await set(ref(database, 'multiplayer/bets'), {});
        setNumPlayers(null);
        setBets({});
        setModal({ show: false, color: null, winners: [] });
        set(ref(database, 'Color'), 'WHITE');
        set(ref(database, 'chosenColors'), {});
        navigate('/colorgame');
    };

    return (
        <>
        {loading && <Loader />}
        <div className="multiplayer">
            <img src="/icons/LEDice1.png" alt="Placeholder" className="multiplayer-image" />
            <h1>Multiplayer Mode</h1>

            {!numPlayers && (
                <div className="player-select">
                    <h4>Select number of players:</h4>
                    {[2, 3, 4].map(n => (
                        <button key={n} onClick={() => handleSetNumPlayers(n)}>{n}</button>
                    ))}
                </div>
            )}

            {numPlayers && (
                <div className="game-area">
                    {/* Top betting row: Players 1 and 2 */}
                    <div className="betting-row-top">
                        {Array.from({ length: Math.min(numPlayers, 2) }, (_, i) => {
                            const playerNum = i + 1;
                            const betCount = (bets[playerNum]?.bets || []).length;
                            return (
                                <div className="player-bet-area" key={playerNum}>
                                    {betCount >= 3 && (
                                        <div className="bet-completed-text-overlay">Bet Completed</div>
                                    )}
                                    <span className="player-label">
                                        <img
                                            src={`/players/player${playerNum}-icon.png`}
                                            alt={`Player ${playerNum}`}
                                        />
                                    </span>
                                    <div className="bet-colors">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                className={`bet-color ${color}`}
                                                onClick={() => handleBet(playerNum, color)}
                                                disabled={betCount >= 3}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Game board */}
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
                    {/* Bottom betting row: Players 3 and 4 */}
                    {numPlayers > 2 && (
                        <div className="betting-row-bottom">
                            {Array.from({ length: numPlayers - 2 }, (_, i) => {
                                const playerNum = i + 3;
                                const betCount = (bets[playerNum]?.bets || []).length;
                                return (
                                    <div className="player-bet-area" key={playerNum}>
                                        {betCount >= 3 && (
                                            <div className="bet-completed-text-overlay">Bet Completed</div>
                                        )}
                                        <span className="player-label">
                                            <img
                                                src={`/players/player${playerNum}-icon.png`}
                                                alt={`Player ${playerNum}`}
                                            />
                                        </span>
                                        <div className="bet-colors">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    className={`bet-color ${color}`}
                                                    onClick={() => handleBet(playerNum, color)}
                                                    disabled={betCount >= 3}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Button for rolling the dice */}
                    {allBetsCompleted && (
                        <div className="roll-dice-area">
                            <button className="roll-dice-btn" onClick={handleRollDice} disabled={loading}>
                                <IoDiceSharp /> Roll Dice
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className='exit-game'>
                <button className="exit-game-btn" onClick={handleEndGame}>
                    <IoMdExit />
                </button>
            </div>
            <div>
                <BoardStatus status={boardStatus} />
            </div>
        </div>
        {/* Modal */}
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
                        <strong>Winner{modal.winners.length > 1 ? 's' : ''}:</strong>
                        {modal.winners.length === 0 ? (
                            <span style={{ marginLeft: 8 }}>No winners</span>
                        ) : (
                            <span style={{ marginLeft: 8 }}>
                                {modal.winners.map(num => `Player ${num}`).join(', ')}
                            </span>
                        )}
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

export default Multiplayer