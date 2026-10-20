import {createRoot} from 'react-dom/client';
import Radar from '../app/radar';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<Radar storageMode="browser"/>);
