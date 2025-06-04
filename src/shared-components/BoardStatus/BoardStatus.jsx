import React from 'react';
import { IoCheckmarkCircleSharp, IoCloseCircleSharp } from "react-icons/io5";
import './BoardStatus.css'; 

function BoardStatus({ status }) {
    const boardStatusClass = status === "On" ? "connected" : "disconnected";

    return (
        <div className={`board-status ${boardStatusClass}`}>
            {status === "On" ? <IoCheckmarkCircleSharp /> : <IoCloseCircleSharp />}
            <p>Board {status === "On" ? "Online" : "Offline"}</p>
        </div>
    );
}

export default BoardStatus