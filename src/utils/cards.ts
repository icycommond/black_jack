import { Card, Suit, Rank, Deck } from '../types/game';

// 创建一副新牌
export function createDeck(): Deck {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: getValue(rank),
      });
    }
  }

  return deck;
}

// 获取牌的点数
function getValue(rank: Rank): number {
  if (rank === 'A') return 11;  // A默认为11，在计算总点数时再决定是否转为1
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank);
}

// Fisher-Yates 洗牌算法
export function shuffleDeck(deck: Deck): Deck {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

// 从牌堆顶抽一张牌
export function drawCard(deck: Deck): [Card, Deck] {
  if (deck.length === 0) {
    throw new Error('牌堆已空！');
  }
  const card = deck[0];
  const remainingDeck = deck.slice(1);
  return [card, remainingDeck];
}

// 计算手牌总点数
export function calculateHandValue(hand: Card[]): number {
  let sum = 0;
  let aces = 0;

  // 先计算非A的牌
  for (const card of hand) {
    if (card.rank === 'A') {
      aces += 1;
    } else {
      sum += card.value;
    }
  }

  // 再处理A
  for (let i = 0; i < aces; i++) {
    if (sum + 11 <= 21) {
      sum += 11;
    } else {
      sum += 1;
    }
  }

  return sum;
} 