import { BoardProvider } from './context/BoardContext';
import { GameProvider } from './context/GameContext';
import { Board } from './components/Board';
import './index.css';

function App() {
  return (
    <GameProvider>
      <BoardProvider>
        <Board />
      </BoardProvider>
    </GameProvider>
  );
}

export default App;
