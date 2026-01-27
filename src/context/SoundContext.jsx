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
    const playClick = () => playTone(800, 'square', 0.05, 0.05); // Short high blip
    const playHover = () => playTone(600, 'triangle', 0.02, 0.02); // Very short soft blip

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
