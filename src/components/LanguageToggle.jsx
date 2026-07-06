import React from 'react';
import './LanguageToggle.css';

const LanguageToggle = ({ language, setLanguage }) => {
    return (
        <div className="language-toggle">
            <button
                className={language === 'english' ? 'active' : ''}
                onClick={() => setLanguage('english')}
            >
                🇬🇧 English
            </button>
            <button
                className={language === 'urdu' ? 'active' : ''}
                onClick={() => setLanguage('urdu')}
            >
                🇵🇰 اردو
            </button>
        </div>
    );
};

export default LanguageToggle;