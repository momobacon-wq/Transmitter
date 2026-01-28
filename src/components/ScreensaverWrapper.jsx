import React, { useState, useEffect, useCallback, useRef } from 'react';
import MatrixRain from './MatrixRain';

const ScreensaverWrapper = ({ children, timeoutMs = 120000 }) => {
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (isActive) {
            setIsActive(false);
        }
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            setIsActive(true);
        }, timeoutMs);
    }, [isActive, timeoutMs]);

    useEffect(() => {
        // Initial timer
        resetTimer();

        // Listeners for activity
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);

    return (
        <>
            {children}
            {isActive && <MatrixRain />}
        </>
    );
};

export default ScreensaverWrapper;
