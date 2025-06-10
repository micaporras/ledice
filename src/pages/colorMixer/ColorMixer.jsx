import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './ColorMixer.css';
import { MdKeyboardVoice } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { ref, set, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import BoardStatus from "../../shared-components/BoardStatus/BoardStatus";

const COLORS = {
    red: "#ff0000",
    yellow: "#ffe135",
    blue: "#0033cc",
    orange: "#ff9933",
    green: "#00b86b",
    purple: "#a259e6",
    redorange: "#e15434",
    yelloworange: "#ffb84d",
    bluegreen: "#36c6aa",
    yellowgreen: "#c0db62",
    redpurple: "#b24f8c",
    bluepurple: "#5e30dc",
    orangegreen: "#a3b18c",
    brown: "#8b4513",
};

const MIX_TABLE = {
    // Primary + Primary
    "red+yellow": "orange",
    "blue+red": "purple",
    "blue+yellow": "green",
    // Primary + Secondary 
    "orange+red": "redorange",
    "orange+yellow": "yelloworange",
    "blue+green": "bluegreen",
    "green+yellow": "yellowgreen",
    "purple+red": "redpurple",
    "blue+purple": "bluepurple",
    // Secondary + Secondary 
    "green+orange": "brown",
    "orange+purple": "brown",
    "green+purple": "brown",
};

function ColorMixer() {
    const navigate = useNavigate();

    const [selected, setSelected] = useState([]);
    const [mixResult, setMixResult] = useState("#fff");
    const recognitionRef = useRef(null);
    const [boardStatus, setBoardStatus] = useState("");
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [listening, setListening] = useState(false);
    const [shouldMix, setShouldMix] = useState(false);

    const readySfxRef1 = useRef(null);
    const readySfxRef2 = useRef(null);
    const [readyToggle, setReadyToggle] = useState(false);
    const notRecognizedSfxRef = useRef(null);

    useEffect(() => {
        const ledRef = ref(database, 'Board');
        const unsubscribe = onValue(ledRef, (snapshot) => {
            const value = snapshot.val();
            setBoardStatus(value === "Off" ? "Off" : "On");
        });
        return () => unsubscribe();
    }, []);

    const handleSelect = (color) => {
        setSelected(prev =>
            prev.length === 2 ? [color] : prev.includes(color) ? prev : [...prev, color]
        );
    };

    useEffect(() => {
        if (shouldMix) {
            handleMix();
            setShouldMix(false);
        }
    }, [selected, shouldMix]);

    // Update Color in database
    const updateColorInDB = (colorName) => {
        set(ref(database, 'Color'), colorName.toUpperCase());
    };

    const handleMix = () => {
        if (selected.length === 1) {
            setMixResult(COLORS[selected[0]]);
            updateColorInDB(selected[0]);
        } else if (selected.length === 2) {
            // Sort the colors alphabetically for consistent key lookup
            const key = [...selected].sort().join("+");
            const result = MIX_TABLE[key];
            setMixResult(COLORS[result] || "#888");
            if (result) {
            updateColorInDB(result);
            } else {
                set(ref(database, 'Color'), 'RANDOM');
            }
        }
    };

    const handleEndGame = async () => {
        set(ref(database, 'Color'), 'RANDOM');
        navigate('/');
    };

    // --- Voice Command ---
    const handleVoice = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        // Helper to alternate ready SFX
        const playReadySfx = () => {
            if (!readyToggle && readySfxRef1.current) {
                readySfxRef1.current.currentTime = 0;
                readySfxRef1.current.play();
            } else if (readyToggle && readySfxRef2.current) {
                readySfxRef2.current.currentTime = 0;
                readySfxRef2.current.play();
            }
            setReadyToggle(t => !t);
        };

        if (!recognitionRef.current) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                // Mix command
                const mixMatch = transcript.match(/mix (\w+) (and|&) (\w+)/);
                if (mixMatch) {
                    const c1 = mixMatch[1];
                    const c2 = mixMatch[3];
                    if (COLORS[c1] && COLORS[c2]) {
                        playReadySfx();
                        setTimeout(() => {
                            setSelected([c1, c2]);
                            setShouldMix(true);
                        }, 600); // Adjust timeout to match your SFX length
                        return;
                    }
                }
                // Set color command
                const setMatch = transcript.match(/set (the )?color to (\w+)/);
                if (setMatch) {
                    const c = setMatch[2];
                    if (COLORS[c]) {
                        playReadySfx();
                        setTimeout(() => {
                            setSelected([c]);
                            setMixResult(COLORS[c]);
                            updateColorInDB(c);
                        }, 600); // Adjust timeout to match your SFX length
                        return;
                    }
                }
                // Not recognized
                if (notRecognizedSfxRef.current) {
                    notRecognizedSfxRef.current.currentTime = 0;
                    notRecognizedSfxRef.current.play();
                }
            };
            recognition.onend = () => setListening(false);
            recognition.onerror = () => setListening(false);
            recognitionRef.current = recognition;
        }
        setListening(true);
        recognitionRef.current.start();
    };

    return (
        <div className="color-mixer">
            {/* SFX audio elements */}
            <audio ref={readySfxRef1} src="/sounds/sure.mp3" />
            <audio ref={readySfxRef2} src="/sounds/okay.mp3" />
            <audio ref={notRecognizedSfxRef} src="/sounds/sorry.mp3" />

            <BoardStatus status={boardStatus} />
            <img src="/icons/LEDice1.png" alt="Placeholder" className="colormixer-image" />
            <h2>Color Mixer</h2>
            <div className="mixer-square" style={{
                background: mixResult,
                margin: "32px auto",
                width: 320,
                height: 220,
                border: "2px solid #fff"
            }} />
            <div className="color-mixer-row">
                <div>
                    <div className="color-label">Primary Colors</div>
                    <div className="color-palette">
                        {["red", "yellow", "blue"].map(c => (
                            <div
                                key={c}
                                className={`color-swatch ${c} ${selected.includes(c) ? "selected" : ""}`}
                                style={{ background: COLORS[c] }}
                                onClick={() => handleSelect(c)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="color-label">Secondary Colors</div>
                    <div className="color-palette">
                        {["purple", "orange", "green"].map(c => (
                            <div
                                key={c}
                                className={`color-swatch ${c} ${selected.includes(c) ? "selected" : ""}`}
                                style={{ background: COLORS[c] }}
                                onClick={() => handleSelect(c)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mixer-controls">
                <button className="mix-btn" onClick={handleMix} style={{ margin: "24px auto 0" }}>
                Mix Colors
                </button>
                <div className="voice-controls">
                    <button className={`voice-btn${listening ? " listening" : ""}`} onClick={handleVoice} disabled={listening}>
                        <MdKeyboardVoice /> {listening ? " Listening..." : " Use Voice Command"}
                    </button>
                    <button className="info-btn" onClick={() => setShowInfoModal(true)}>
                        <FaInfo />
                    </button>

                </div>
                
            </div>
            <div className='exit-game'>
                <button className="exit-game-btn" onClick={handleEndGame}>
                    <IoMdExit />
                </button>
            </div>

            {showInfoModal && (
                <div className="mixer-modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="mixer-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Voice Command Guide</h3>
                        <ul>
                            <li>
                                <b>Mix [color1] and [color2]</b><br />
                                <span>Example: "Mix red and blue"</span>
                            </li>
                            <li>
                                <b>Set the color to [color]</b><br />
                                <span>Example: "Set the color to green"</span><br />
                                <span style={{fontStyle: "italic"}}>Note: Only base colors are acceptable</span>
                            </li>
                        </ul>
                        <button className="close-modal-btn" onClick={() => setShowInfoModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
            
        </div>
    )
}

export default ColorMixer