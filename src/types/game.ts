export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  hidden?: boolean;
}

export type Deck = Card[];

export type GameStatus = 'idle' | 'betting' | 'playing' | 'bust' | 'dealer-turn' | 'game-over';

export type BetAmount = 10 | 50 | 100 | 500; 