import { GameBoard } from './components/GameBoard';

function App() {
  return (
    <div className="min-h-screen bg-green-800 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-green-700 shadow-lg sm:rounded-3xl sm:p-20">
          <GameBoard />
        </div>
      </div>
    </div>
  );
}

export default App;
