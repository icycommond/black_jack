import { useState, useCallback } from 'react';
import { Card, Deck, GameStatus, BetAmount } from '../types/game';
import { createDeck, shuffleDeck, drawCard, calculateHandValue } from '../utils/cards';

export function useGame() {
  const [deck, setDeck] = useState<Deck>(() => shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [message, setMessage] = useState<string>('等待开始');
  
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
    const currentDeck = shuffledDeck;
    
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
  const handleWin = useCallback(() => {
    setChips(prev => prev + currentBet * 2);
    setMessage(`你赢了！获得 ${currentBet} 筹码！`);
  }, [currentBet]);

  // 结算输钱
  const handleLose = useCallback(() => {
    setMessage(`你输了！损失 ${currentBet} 筹码！`);
  }, [currentBet]);

  // 结算平局
  const handleTie = useCallback(() => {
    setChips(prev => prev + currentBet);
    setMessage('平局！返还下注。');
  }, [currentBet]);

  // 检查是否是五龙（5张牌且不超过21点）
  const isFiveDragon = (hand: Card[]): boolean => {
    return hand.length === 5 && calculateHandValue(hand) <= 21;
  };

  // 检查是否是五龙牌（前4张小于21点，第5张爆掉）
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
      setChips((prev) => prev - currentBet * 4);
      setMessage(`五龙爆牌！损失 ${currentBet * 5} 筹码！`);
      setGameStatus('game-over');
    } else if (currentValue > 21) {
      // 普通爆牌
      setMessage(`爆牌了！损失 ${currentBet} 筹码！`);
      setGameStatus('game-over');
    } else if (newPlayerHand.length === 4) {
      // 提示玩家当前是第四张牌
      setMessage("注意：下一张牌将触发五龙判定！");
    }
  }, [deck, playerHand, gameStatus, currentBet]);

  // 更新结果判定
  const determineWinner = useCallback(({ player, dealer}: { player?: Card[]; dealer?: Card[]}) => {
    const playerValue = calculateHandValue(player ?? playerHand);
    const dealerValue = calculateHandValue(dealer ?? dealerHand);

    if (gameStatus === 'game-over') return;

    if (playerValue > 21) {
      handleLose();
    } else if (dealerValue > 21) {
      handleWin();
    } else {
      if (dealerValue > playerValue) {
        handleLose();
      } else if (dealerValue < playerValue) {
        handleWin();
      } else {
        handleTie();
      }
    }
    
    setGameStatus('game-over');
  }, [playerHand, dealerHand, gameStatus, handleWin, handleLose, handleTie]);


  // 庄家行动
  const dealerPlay = useCallback(async () => {
    // let currentDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
    let currentDeck = deck;
    let newHand: Card[] = [];

    const dealerAction = async (currentDealerHand: Card[]) => {
      // 使用 Promise 来处理延时
      await new Promise((resolve) => setTimeout(resolve, 1000));
      newHand = currentDealerHand;

      const dealerValue = calculateHandValue(currentDealerHand);

      if (dealerValue < 17 && currentDealerHand.length < 5) {
        // 庄家要牌
        const [newCard, remainingDeck] = drawCard(currentDeck);
        currentDealerHand = [
          ...currentDealerHand,
          { ...newCard, hidden: false },
        ];
        currentDeck = remainingDeck;

        // 更新状态
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
        setMessage(
          `庄家要牌...（当前 ${calculateHandValue(currentDealerHand)} 点）`
        );

        // 使用 await 等待下一次行动
        await dealerAction(currentDealerHand);
      } else {
        // 庄家停牌
        const stopReason =
          currentDealerHand.length >= 5
            ? "已达到5张牌上限"
            : `点数已达到${dealerValue}点`;
        setMessage(`庄家停牌（${stopReason})`);

        // 确保最终手牌状态已更新
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
      }
    };

    // 开始庄家回合
    await dealerAction(dealerHand.map((card) => ({ ...card, hidden: false })));

    // 进行结果判定
    determineWinner({ dealer: newHand });
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