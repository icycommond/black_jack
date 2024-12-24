import { useState, useCallback } from 'react';
import { Card, Deck, GameStatus, BetAmount } from '../types/game';
import { createDeck, shuffleDeck, drawCard, calculateHandValue } from '../utils/cards';

export function useGame() {
  const [deck, setDeck] = useState<Deck>(() => shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [message, setMessage] = useState<string>('');
  
  // 筹码相关状态
  const [chips, setChips] = useState<number>(1000); // 玩家总筹码
  const [currentBet, setCurrentBet] = useState<number>(0); // 当前下注金额

  // 下注
  const placeBet = (amount: BetAmount) => {
    if (gameStatus !== 'betting' || chips < amount) return;
    
    setCurrentBet(prev => prev + amount);
    setChips(prev => prev - amount);
  };

  // 开始新游戏
  const startNewGame = () => {
    // 重置游戏状态
    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setGameStatus('betting');
    setMessage('请下注');
  };

  // 开始发牌
  const startDealing = () => {
    if (gameStatus !== 'betting' || currentBet === 0) return;

    const shuffledDeck = shuffleDeck(createDeck());
    let currentDeck = shuffledDeck;
    
    // 发两张牌给玩家
    const [card1, deck1] = drawCard(currentDeck);
    const [card2, deck2] = drawCard(deck1);
    
    // 发两张牌给庄家
    const [dealerCard1, deck3] = drawCard(deck2);
    const [dealerCard2, deck4] = drawCard(deck3);

    setDeck(deck4);
    setPlayerHand([card1, card2]);
    setDealerHand([
      dealerCard1,
      { ...dealerCard2, hidden: true }
    ]);
    setGameStatus('playing');
    setMessage('你的回合');
  };

  // 结算赢钱
  const handleWin = () => {
    setChips(prev => prev + currentBet * 2); // 赢得双倍下注
    setMessage(`你赢了！获得 ${currentBet} 筹码！`);
  };

  // 结算输钱
  const handleLose = () => {
    setMessage(`你输了！损失 ${currentBet} 筹码！`);
  };

  // 结算平局
  const handleTie = () => {
    setChips(prev => prev + currentBet); // 返还下注
    setMessage('平局！返还下注。');
  };

  // 检查是否是五龙（5张牌且不超过21点）
  const isFiveDragon = (hand: Card[]): boolean => {
    return hand.length === 5 && calculateHandValue(hand) <= 21;
  };

  // 检查是否是五龙爆牌（前4张小于21点，第5张爆掉）
  const isFiveDragonBust = (hand: Card[]): boolean => {
    if (hand.length !== 5) return false;
    const firstFourValue = calculateHandValue(hand.slice(0, 4));
    const totalValue = calculateHandValue(hand);
    return firstFourValue <= 21 && totalValue > 21;
  };

  // 玩家要牌
  const hit = useCallback(() => {
    if (gameStatus !== 'playing') return;

    const [card, remainingDeck] = drawCard(deck);
    const newPlayerHand = [...playerHand, card];
    setPlayerHand(newPlayerHand);
    setDeck(remainingDeck);

    const currentValue = calculateHandValue(newPlayerHand);

    if (isFiveDragon(newPlayerHand)) {
      // 五龙成功！
      setChips(prev => prev + currentBet * 5);
      setMessage(`恭喜！五龙成功！赢得 ${currentBet * 5} 筹码！`);
      setGameStatus('game-over');
    } else if (isFiveDragonBust(newPlayerHand)) {
      // 五龙爆牌！
      setMessage(`五龙爆牌！损失 ${currentBet * 5} 筹码！`);
      setGameStatus('game-over');
    } else if (currentValue > 21) {
      // 普通爆牌
      setMessage(`爆牌了！损失 ${currentBet} 筹码！`);
      setGameStatus('game-over');
    } else if (newPlayerHand.length === 4) {
      // 提示玩家当前是第四张牌
      setMessage('注意：下一张牌将触发五龙判定！');
    }
  }, [deck, playerHand, gameStatus, currentBet]);

  // 更新结果判定
  const determineWinner = useCallback(() => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    // 如果已经触发五龙相关规则，不需要再判定
    if (gameStatus === 'game-over') return;

    if (playerValue > 21) {
      handleLose();
    } else if (dealerValue > 21) {
      handleWin();
    } else if (dealerValue > playerValue) {
      handleLose();
    } else if (dealerValue < playerValue) {
      handleWin();
    } else {
      handleTie();
    }
    
    setGameStatus('game-over');
  }, [playerHand, dealerHand, gameStatus]);

  // 检查是否爆牌
  const checkBust = (hand: Card[]): boolean => {
    return calculateHandValue(hand) > 21;
  };

  // 庄家行动
  const dealerPlay = useCallback(async () => {
    let currentDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
    let currentDeck = deck;

    // 使用 setTimeout 来创建视觉延迟，使庄家的行动更容易观察
    const dealerAction = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const dealerValue = calculateHandValue(currentDealerHand);
          
          if (dealerValue < 17) {
            // 庄家要牌
            const [card, remainingDeck] = drawCard(currentDeck);
            currentDealerHand = [...currentDealerHand, card];
            currentDeck = remainingDeck;
            
            setDealerHand(currentDealerHand);
            setDeck(currentDeck);
            setMessage(`庄家要牌...（当前 ${calculateHandValue(currentDealerHand)} 点）`);
            
            // 继续行动
            dealerAction().then(resolve);
          } else {
            // 庄家停牌
            setMessage(`庄家停牌（${dealerValue} 点）`);
            resolve();
          }
        }, 1000); // 1秒延迟
      });
    };

    // 开始庄家回合
    await dealerAction();
    
    // 判定输赢
    determineWinner();
  }, [deck, dealerHand, determineWinner]);

  // 玩家停牌
  const stand = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    setGameStatus('dealer-turn');
    setMessage('庄家回合开始');
    
    // 揭开庄家的暗牌
    setDealerHand(dealerHand.map(card => ({ ...card, hidden: false })));
    
    // 开始庄家的回合
    dealerPlay();
  }, [gameStatus, dealerHand, dealerPlay]);

  return {
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
  };
} 