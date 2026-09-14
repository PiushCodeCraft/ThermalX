import { BrowserRouter } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import './styles/global.css';

export function App() {

  return (
    <BrowserRouter>
      {/* <AuthPage /> */}
      <LandingPage />
    </BrowserRouter>
  );
}
export default App;