import { useGame } from '../hooks/useGame';
import { Hand } from './Hand';
import { BetAmount } from '../types/game';

const BET_OPTIONS: BetAmount[] = [10, 50, 100, 500];

export function GameBoard() {
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
    stand 
  } = useGame();

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="flex justify-between w-full px-4">
        <div className="text-white text-xl">
          筹码: {chips}
        </div>
        <div className="text-white text-xl">
          当前下注: {currentBet}
        </div>
      </div>

      <Hand cards={dealerHand} isDealer />
      
      <div className="h-px w-full bg-gray-300" />
      
      <div className="flex flex-col items-center gap-2">
        <Hand cards={playerHand} />
        {gameStatus === 'playing' && (
          <div className="text-white text-lg">
            当前 {playerHand.length} 张牌
            {playerHand.length === 4 && (
              <span className="text-yellow-400 ml-2">
                ⚠️ 下一张将触发五龙判定
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="text-white text-xl font-bold">
        {message}
      </div>
      
      <div className="flex gap-4">
        {gameStatus === 'idle' ? (
          <button
            onClick={startNewGame}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            开始游戏
          </button>
        ) : gameStatus === 'betting' ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2">
              {BET_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => placeBet(amount)}
                  disabled={chips < amount}
                  className={`px-4 py-2 rounded-lg ${
                    chips >= amount
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  } text-white`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <button
              onClick={startDealing}
              disabled={currentBet === 0}
              className={`px-6 py-2 rounded-lg ${
                currentBet > 0
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed'
              } text-white`}
            >
              开始发牌
            </button>
          </div>
        ) : gameStatus === 'playing' ? (
          <>
            <button
              onClick={hit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              要牌
            </button>
            <button
              onClick={stand}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              停牌
            </button>
          </>
        ) : (
          <button
            onClick={startNewGame}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            新游戏
          </button>
        )}
      </div>
    </div>
  );
} 