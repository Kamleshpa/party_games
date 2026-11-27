import { createRoot } from 'react-dom/client';
import './styles.css';
import { TvApp } from './tv/TvApp';
import { PhoneApp } from './phone/PhoneApp';

// Forget the party password the password page handed over (middleware.ts); the access key stays.
document.cookie = 'dpn_try=; path=/; max-age=0';

const isTv = window.location.pathname.indexOf('/tv') === 0;
document.body.className = isTv ? 'is-tv' : 'is-phone';

createRoot(document.getElementById('root')!).render(isTv ? <TvApp /> : <PhoneApp />);
