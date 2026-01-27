import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

import { logLogin } from '../services/api';

import { useSound } from '../context/SoundContext';

const Login = () => {
    const [inputVal, setInputVal] = useState('');
    const { login } = useGame();
    const { playBootup, playClick, playKeystroke, speak } = useSound();
    const navigate = useNavigate();

    const handleStart = (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        playBootup(); // Gameboy boot sound!
        speak("Welcome User");
        logLogin(inputVal); // Log the login event
        login(inputVal);
        navigate('/inventory');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            textAlign: 'center'
        }}>
            <div className="nes-container is-dark with-title is-centered">
                <p className="title" style={{ fontSize: '1.5rem', marginTop: '-1rem' }}>物料管理系統</p>

                <div style={{ marginBottom: '2rem' }}>
                    <i className="nes-icon coin is-large"></i>
                </div>

                <p>PRESS START TO ENTER</p>

                <form onSubmit={handleStart} style={{ marginTop: '2rem' }}>
                    <div className="nes-field">
                        <label htmlFor="employee_id">請輸入姓名</label>
                        <input
                            type="text"
                            id="employee_id"
                            className="nes-input"
                            placeholder="請輸入..."
                            value={inputVal}
                            onChange={(e) => {
                                playKeystroke();
                                setInputVal(e.target.value);
                            }}
                            autoFocus
                        />
                    </div>

                    <br />

                    <button type="submit" className="nes-btn is-primary">
                        INSERT COIN
                    </button>
                </form>
            </div>

            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>v1.0.0 8-BIT EDITION</p>
        </div>
    );
};

export default Login;
