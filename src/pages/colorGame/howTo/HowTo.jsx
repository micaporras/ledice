import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HowTo.css'; 
import { IoMdExit } from "react-icons/io";


function HowTo() {

    const navigate = useNavigate();

    const handleExit = () => {
        navigate('/colorgame');
    }

    return (
        <div className="how-to-container">
            <h1>How To Play: Color Game</h1>
            <h2>Single Player Mode</h2>
            <ol>
                <li>Choose up to <b>3 different colors</b> to bet on by clicking the color buttons.</li>
                <li>Once you have placed 3 bets, click the <b>Roll Dice</b> button.</li>
                <li>A random color will be selected after a short suspense period.</li>
                <li>
                    If the winning color matches any of your chosen colors, you win!<br />
                    The result will be shown in a modal as <b>"You Won"</b> or <b>"You Lose"</b>.
                </li>
                <li>Click <b>Play Again</b> to start a new round, or <b>End Game</b> to exit.</li>
            </ol>

            <h2>Multiplayer Mode</h2>
            <ol>
                <li>Select the number of players (2-4) to start the game.</li>
                <li>
                    Each player takes turns to place up to <b>3 bets</b> on different colors.<br />
                </li>
                <li>
                    When all players have placed their bets, click the <b>Roll Dice</b> button.
                </li>
                <li>
                    After a suspense period, a random color is chosen as the winner.<br />
                    The modal will display the winning color and which player(s) won.
                </li>
                <li>
                    Click <b>Play Again</b> to reset bets for another round, or <br /> 
                    <b>End Game</b> to exit to the main menu.
                </li>
            </ol>

            <h3>Tips</h3>
            <ul>
                <li>You can remove a bet by clicking on your icon in the color grid before rolling the dice.</li>
                <li>The board status at the top left shows if the game board is connected.</li>
            </ul>

            <div className='exit-game'>
                <button className="exit-game-btn" onClick={handleExit}>
                    <IoMdExit />
                </button>
            </div>
        </div>
    );
}

export default HowTo