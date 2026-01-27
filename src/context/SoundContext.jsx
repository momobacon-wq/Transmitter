import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const audioCtxRef = useRef(null);
    const [muted, setMuted] = useState(false);

    // Initialize AudioContext on user interaction
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        } else if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playTone = (freq, type, duration, vol = 0.1) => {
        if (muted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    // 8-bit Sound Presets

    // Randomized click for variety
    const playClick = () => {
        if (muted) return;
        // Random pitch between 750 and 850
        const freq = 750 + Math.random() * 100;
        playTone(freq, 'square', 0.05, 0.05);
    };

    const playHover = () => playTone(600, 'triangle', 0.02, 0.02);

    // GAMEBOY STYLE BOOTUP
    const playBootup = () => {
        if (muted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const now = ctx.currentTime;

        // Arpeggio: C4 - E4 - G4 - C5 (Ping!)
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0.05, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    };

    // ZAP / LASER (for Delete/Logout)
    const playZap = () => {
        if (muted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';

        // Fast pitch drop
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    };

    // WARNING (Low double tone)
    const playWarning = () => {
        if (muted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const now = ctx.currentTime;

        // Two low square waves detuned
        [150, 155].forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        });
    };

    const playSuccess = () => {
        if (muted) return;
        initAudio();
        // Coin sound: Two tones rising
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const now = ctx.currentTime;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(900, now);
        gain1.gain.setValueAtTime(0.05, now);
        gain1.gain.linearRampToValueAtTime(0, now + 0.1);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);

        // Tone 2 (higher)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1350, now + 0.1);
        gain2.gain.setValueAtTime(0.05, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
    };

    const playError = () => {
        if (muted) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const now = ctx.currentTime;

        // Descending sawtooth (failure sound)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    };

    const toggleMute = () => setMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{
            playClick,
            playHover,
            playSuccess,
            playError,
            playBootup,
            playZap,
            playWarning,
            muted,
            toggleMute
        }}>
            {children}
            {/* Global Mute Button (Optional position, usually fixed in corner) */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
                <button
                    type="button"
                    className={`nes-btn is-${muted ? 'error' : 'primary'}`}
                    onClick={toggleMute}
                    style={{ padding: '0px 8px', fontSize: '0.8rem' }}
                >
                    {muted ? '🔇' : '🔊'}
                </button>
            </div>
        </SoundContext.Provider>
    );
};

SoundProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default SoundProvider;
