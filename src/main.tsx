import { createRoot } from 'react-dom/client';
import './styles.css';
import { TvApp } from './tv/TvApp';
import { PhoneApp } from './phone/PhoneApp';

const isTv = window.location.pathname.indexOf('/tv') === 0;
document.body.className = isTv ? 'is-tv' : 'is-phone';

createRoot(document.getElementById('root')!).render(isTv ? <TvApp /> : <PhoneApp />);
