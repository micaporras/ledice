import React from 'react';
import './Loader.css'; 

function Loader() {

    return (
        <div className='loader-container'>
            <div className="loaderViewPort">
                <div className="loader">
                    <div className="side front">
                    <div className="dot"></div>
                    </div>
                    <div className="side back">
                    <div className="dotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                    </div>
                    <div className="side left">
                    <div className="dotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                    </div>
                    <div className="side right">
                    <div className="dotContainer">
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                    </div>
                    </div>
                    <div className="side top">
                    <div className="dotContainer">
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        </div>
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                    </div>
                    </div>
                    <div className="side bottom">
                    <div className="dotContainer">
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                        <div className="subDotContainer">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loader