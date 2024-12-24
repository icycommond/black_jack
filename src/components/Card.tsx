import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const { suit, rank, hidden } = card;
  
  // 根据花色决定颜色
  const isRed = suit === '♥' || suit === '♦';
  const textColor = isRed ? 'text-red-600' : 'text-gray-900';

  if (hidden) {
    return (
      <div className="w-24 h-36 bg-white rounded-lg shadow-md border-2 border-gray-300 flex items-center justify-center">
        <div className="w-20 h-32 bg-blue-600 rounded-md flex items-center justify-center">
          <div className="text-white text-2xl">🂠</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-24 h-36 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col p-2 leading-none">
      {/* 左上角 */}
      <div className={`text-left ${textColor}`}>
        <div className="text-xl font-bold leading-none">{rank}</div>
        <div className="text-xl leading-none">{suit}</div>
      </div>

      {/* 中间花色 */}
      <div
        className={`flex-grow flex items-center justify-center ${textColor}`}
      >
        <span className="text-4xl">{suit}</span>
      </div>

      {/* 右下角（旋转180度） */}
      <div className={`transform rotate-180 ${textColor}`}>
        <div className="text-xl font-bold leading-none">{rank}</div>
        <div className="text-xl leading-none">{suit}</div>
      </div>
    </div>
  );
} 