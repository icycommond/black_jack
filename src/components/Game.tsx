import { useGame } from '../hooks/useGame';
import { Hand } from './Hand';
import { BetAmount } from '../types/game';
import '../styles/Game.css';

const BET_OPTIONS: BetAmount[] = [10, 50, 100, 500];

const Game = () => {
  const { 
    playerHand, 
    dealerHand, 
    gameStatus, 
    message,
    chips,
    currentBet,
    startNewGame, 
    placeBet,
    startDealing,
    hit,
    stand,
    bestRecord,
  } = useGame();

  return (
    <div className="game-container min-h-screen">
      <div className="game-table">
        <div className="flex justify-between w-full px-4 py-2">
          <div className="text-yellow-400 text-lg">
            筹码: {chips}
          </div>
          <div className="text-yellow-400 text-lg">
            当前下注: {currentBet}
          </div>
        </div>

        <div className="dealer-area min-h-[120px] py-2">
          <Hand cards={dealerHand} isDealer />
        </div>
        
        <div className="status-bar my-1">
          {message}
        </div>

        <div className="player-area min-h-[120px] py-2">
          <Hand cards={playerHand} />
          {gameStatus === 'playing' && (
            <div className="text-white text-sm text-center mt-2">
              当前 {playerHand.length} 张牌
              {playerHand.length === 4 && (
                <span className="text-yellow-400 ml-2">
                  ⚠️ 下一张将触发五龙判定
                </span>
              )}
            </div>
          )}
        </div>

        <div className="controls mt-2">
          {gameStatus === 'idle' ? (
            <button
              onClick={startNewGame}
              className="button bg-green-600 hover:bg-green-700"
            >
              开始游戏
            </button>
          ) : gameStatus === 'betting' ? (
            <div className="flex flex-col gap-4 items-center">
              <div className="chips-area">
                {BET_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    disabled={chips < amount}
                    className={`chip ${
                      chips >= amount
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <button
                onClick={startDealing}
                disabled={currentBet === 0}
                className={`button ${
                  currentBet > 0
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600'
                }`}
              >
                开始发牌
              </button>
            </div>
          ) : gameStatus === 'playing' ? (
            <>
              <button
                onClick={hit}
                className="button bg-blue-600 hover:bg-blue-700"
              >
                要牌
              </button>
              <button
                onClick={stand}
                className="button bg-yellow-600 hover:bg-yellow-700"
              >
                停牌
              </button>
            </>
          ) : (
            <button
              onClick={startNewGame}
              className="button bg-green-600 hover:bg-green-700"
            >
              新游戏
            </button>
          )}
        </div>
        <div className="flex justify-center items-center text-sm mt-2">最佳战绩:&ensp; <span className="text-yellow-400 text-xl">{bestRecord}</span></div>
      </div>
    </div>
  );
};

export default Game; 