import { Card as CardType } from '../types/game';
import { Card } from './Card';
import { calculateHandValue } from '../utils/cards';

interface HandProps {
  cards: CardType[];
  isDealer?: boolean;
}

export function Hand({ cards, isDealer = false }: HandProps) {
  const points = calculateHandValue(cards.filter(card => !card.hidden));
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-bold">
        {isDealer ? '庄家' : '玩家'} ({points}点)
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((card, index) => (
          <Card key={`${card.suit}-${card.rank}-${index}`} card={card} />
        ))}
      </div>
    </div>
  );
} 