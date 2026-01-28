import React, { useState, useEffect } from 'react';

const RetroClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour12: false });
    };

    return (
        <div className="nes-container is-rounded is-dark" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="nes-icon is-small heart"></i>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', color: '#fff' }}>
                {formatTime(time)}
            </span>
        </div>
    );
};

export default RetroClock;
