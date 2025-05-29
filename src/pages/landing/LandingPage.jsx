import { React, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {

    const navigate = useNavigate();

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
            
        </div>
    )
}

export default LandingPage