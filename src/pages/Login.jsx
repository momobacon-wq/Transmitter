import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

import { logLogin, checkUser } from '../services/api';

import { useSound } from '../context/SoundContext';

const Login = () => {
    const [inputVal, setInputVal] = useState('');
    const { login } = useGame();
    const { playBootup, playClick, playKeystroke, speak, playError } = useSound();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleStart = async (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        setVerifying(true);
        setErrorMsg('');

        try {
            const res = await checkUser(inputVal);

            if (res.status === 'success') {
                playBootup();
                speak("Welcome User");
                logLogin(inputVal);
                login(inputVal);
                navigate('/inventory');
            } else {
                playError();
                speak("Access Denied");
                setErrorMsg("ACCESS DENIED / 無權限");
            }
        } catch (err) {
            console.error(err);
            playError();
            setErrorMsg("CONNECTION ERROR / 連線錯誤");
        } finally {
            setVerifying(false);
        }
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
                            value={inputVal}
                            onChange={(e) => {
                                playKeystroke();
                                setInputVal(e.target.value.toUpperCase());
                                setErrorMsg('');
                            }}
                            placeholder="ID..."
                            disabled={verifying}
                        />
                    </div>
                    {errorMsg && <p className="nes-text is-error" style={{ marginTop: '1rem' }}>{errorMsg}</p>}
                    <button type="submit" className={`nes-btn ${verifying ? 'is-disabled' : 'is-primary'}`} style={{ width: '100%' }} disabled={verifying}>
                        {verifying ? 'VERIFYING...' : 'START SYSTEM'}
                    </button>
                </form>
            </div>

            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>v1.0.0 8-BIT EDITION</p>
        </div>
    );
};

export default Login;
