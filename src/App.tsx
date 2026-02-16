import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import DeckBuilder from './pages/DeckBuilder';
import BattleRoom from './pages/BattleRoom';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deck-builder" element={<DeckBuilder />} />
          <Route path="/battle" element={<BattleRoom />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
