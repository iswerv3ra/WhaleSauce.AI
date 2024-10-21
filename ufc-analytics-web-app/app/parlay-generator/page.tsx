'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle } from 'react-feather';
import Link from 'next/link';
import Papa from 'papaparse';
import styles from './ParlayGenerator.module.css';

interface Fight {
  Fighter: string;
  Opponent: string;
  odds_f1: string;
  odds_f2: string;
}

interface Bet {
  fighters: string;
  odds: string;
  customProb: number;
  betAmount: number;
  expectedValue: number;
  payout: number;
  legs: number;
}

interface Result {
  roi: number;
  totalBets: number;
  totalBetsCost: number;
  totalExpectedValue: number;
  totalExpectedPayout: number;
  maxPayout: number;
  selectedBets: Bet[];
}

export default function ParlayGeneratorPage() {
  const [fights, setFights] = useState<Fight[]>([]);
  const [parlayRisk, setParlayRisk] = useState(5);
  const [betSizeRisk, setBetSizeRisk] = useState(5);
  const [numBets, setNumBets] = useState(5);
  const [bankroll, setBankroll] = useState(1000);
  const [strategy, setStrategy] = useState('fixedRisk');
  const [customProbs, setCustomProbs] = useState<number[][]>([]);
  const [recommendedBets, setRecommendedBets] = useState<Bet[]>([]);
  const [resultData, setResultData] = useState<Result | null>(null);
  const [actualWinners, setActualWinners] = useState<string[]>([]);
  const [actualReturn, setActualReturn] = useState<any>(null);

  useEffect(() => {
    // Fetch and parse bovada_fighters_odds.csv
    fetch('/data/bovada_fighters_odds.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<Fight>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            const filteredData = results.data.filter(
              item => item && item.Fighter && item.Opponent
            );
            setFights(filteredData.slice(0, 10)); // Limit to 10 fights for the parlay generator
            // Initialize custom probabilities and actual winners
            const initialProbs = filteredData.slice(0, 10).map(() => [50, 50]); // Default 50-50 confidence
            setCustomProbs(initialProbs);
            setActualWinners(filteredData.slice(0, 10).map(() => ''));
          },
        });
      });
  }, []);

  // Helper functions for calculations
  const americanToDecimal = (odds: number) => {
    if (odds > 0) {
      return 1 + (odds / 100);
    } else {
      return 1 + (100 / Math.abs(odds));
    }
  };

  const oddsToImpliedProbability = (odds: number) => {
    if (odds > 0) {
      return 100 / (odds + 100);
    } else {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
  };

  const decimalToAmerican = (decimal: number) => {
    if (decimal >= 2.0) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      if ((decimal - 1) === 0) {
        return "-1000";
      }
      return `-${Math.round(100 / (decimal - 1))}`;
    }
  };

  const calculateKelly = (probability: number, decimalOdds: number) => {
    const b = decimalOdds - 1;
    const q = 1 - probability;
    if (b === 0) {
      return 0;
    }
    const f = (probability * b - q) / b;
    return Math.max(f, 0);
  };

  const parlayRiskMapping = {
    1: { maxLegs: 1 },
    2: { maxLegs: 1 },
    3: { maxLegs: 2 },
    4: { maxLegs: 2 },
    5: { maxLegs: 3 },
    6: { maxLegs: 3 },
    7: { maxLegs: 4 },
    8: { maxLegs: 4 },
    9: { maxLegs: 5 },
    10: { maxLegs: 5 },
  };

  const betSizeRiskMapping = {
    1: { betFraction: 0.005 },
    2: { betFraction: 0.01 },
    3: { betFraction: 0.015 },
    4: { betFraction: 0.02 },
    5: { betFraction: 0.025 },
    6: { betFraction: 0.03 },
    7: { betFraction: 0.035 },
    8: { betFraction: 0.04 },
    9: { betFraction: 0.045 },
    10: { betFraction: 0.05 },
  };

  // Main calculation function
  const simulateBets = () => {
    const maxLegs = parlayRiskMapping[parlayRisk as keyof typeof parlayRiskMapping].maxLegs;
    const betFraction = betSizeRiskMapping[betSizeRisk as keyof typeof betSizeRiskMapping].betFraction;

    let bets: Bet[] = [];
    let uniqueBets = new Set();

    // Generate potential bets where user's confidence > implied probability
    let potentialBets: any[] = [];

    for (let i = 0; i < fights.length; i++) {
      const fight = fights[i];
      const fighter1Prob = customProbs[i][0] / 100;
      const fighter2Prob = customProbs[i][1] / 100;
      const odds1 = parseFloat(fight.odds_f1);
      const odds2 = parseFloat(fight.odds_f2);
      const impliedProb1 = oddsToImpliedProbability(odds1);
      const impliedProb2 = oddsToImpliedProbability(odds2);

      if (fighter1Prob > impliedProb1) {
        potentialBets.push({ fighter: fight.Fighter, odds: odds1, customProb: fighter1Prob });
      }
      if (fighter2Prob > impliedProb2) {
        potentialBets.push({ fighter: fight.Opponent, odds: odds2, customProb: fighter2Prob });
      }
    }

    // Generate all possible combinations up to maxLegs
    for (let legs = 1; legs <= maxLegs; legs++) {
      const combinations = getCombinations(potentialBets, legs);
      for (let combo of combinations) {
        // Create a unique key to prevent duplicates
        const betKey = combo.map((bet: any) => `${bet.fighter}:${bet.odds}`).join('|');
        if (uniqueBets.has(betKey)) continue;
        uniqueBets.add(betKey);

        // Calculate total decimal odds and total probability
        let totalOdds = 1;
        let totalProb = 1;
        for (let bet of combo) {
          totalOdds *= americanToDecimal(bet.odds);
          totalProb *= bet.customProb;
        }

        // Calculate bet amount based on strategy
        let baseBetAmount = 0;
        if (strategy === 'kelly') {
          const kelly_f = calculateKelly(totalProb, totalOdds);
          baseBetAmount = kelly_f * bankroll;
        } else if (strategy === 'quarterKelly') {
          const kelly_f = calculateKelly(totalProb, totalOdds);
          baseBetAmount = kelly_f * bankroll * 0.25;
        } else {
          baseBetAmount = bankroll * betFraction;
        }

        // Adjust bet amount based on number of legs
        const adjustedBetAmount = legs > 0 ? baseBetAmount / legs : 0;

        // Ensure betAmount is positive and within bankroll
        let betAmount = Math.max(adjustedBetAmount, 0);
        betAmount = Math.min(betAmount, bankroll);

        // Calculate Expected Value
        const expectedValue = (totalProb * totalOdds - 1) * betAmount;

        // Calculate Payout
        const payout = totalOdds * betAmount;

        bets.push({
          fighters: combo.map((bet: any) => bet.fighter).join(' & '),
          odds: decimalToAmerican(totalOdds),
          customProb: parseFloat(totalProb.toFixed(4)),
          betAmount: parseFloat(betAmount.toFixed(2)),
          expectedValue: parseFloat(expectedValue.toFixed(2)),
          payout: parseFloat(payout.toFixed(2)),
          legs: legs,
        });
      }
    }

    // Sort bets by Expected Value descending
    bets.sort((a, b) => b.expectedValue - a.expectedValue);

    // Limit to numBets
    const selectedBets = bets.slice(0, numBets);

    // Calculate statistics
    const totalBets = selectedBets.length;
    const totalBetsCost = selectedBets.reduce((sum, bet) => sum + bet.betAmount, 0);
    const totalExpectedValue = selectedBets.reduce((sum, bet) => sum + bet.expectedValue, 0);
    const totalExpectedPayout = selectedBets.reduce((sum, bet) => sum + bet.payout, 0);
    const roi = totalBetsCost > 0 ? (totalExpectedValue / totalBetsCost) * 100 : 0;
    const maxPayout = totalExpectedPayout;

    const result: Result = {
      roi: parseFloat(roi.toFixed(2)),
      totalBets,
      totalBetsCost: parseFloat(totalBetsCost.toFixed(2)),
      totalExpectedValue: parseFloat(totalExpectedValue.toFixed(2)),
      totalExpectedPayout: parseFloat(totalExpectedPayout.toFixed(2)),
      maxPayout: parseFloat(maxPayout.toFixed(2)),
      selectedBets,
    };

    setRecommendedBets(selectedBets);
    setResultData(result);
  };

  // Helper function to get combinations
  const getCombinations = (array: any[], length: number) => {
    function* doCombination(offset: number, combo: any[]) {
      if (combo.length === length) {
        yield combo;
        return;
      }
      for (let i = offset; i < array.length; i++) {
        yield* doCombination(i + 1, combo.concat(array[i]));
      }
    }
    return Array.from(doCombination(0, []));
  };

  // Function to calculate actual return
  const calculateActualReturn = () => {
    // Validate that all winners are selected
    for (let winner of actualWinners) {
      if (!winner) {
        alert('Please select all winners before calculating actual return.');
        return;
      }
    }

    let actualResults = [];
    let totalReturn = 0;
    let totalBetCost = 0;

    for (let bet of recommendedBets) {
      const fighters = bet.fighters.split(' & ');
      let betWon = true;
      for (let fighter of fighters) {
        // Find the fight index for this fighter
        let fightIndex = fights.findIndex(fight => fight.Fighter === fighter || fight.Opponent === fighter);
        if (fightIndex === -1) {
          betWon = false;
          break;
        }
        if (actualWinners[fightIndex] !== fighter) {
          betWon = false;
          break;
        }
      }
      actualResults.push({
        bet,
        won: betWon,
      });
      if (betWon) {
        totalReturn += bet.payout;
      }
      totalBetCost += bet.betAmount;
    }

    const netProfit = totalReturn - totalBetCost;
    const roi = totalBetCost > 0 ? (netProfit / totalBetCost) * 100 : 0;

    setActualReturn({
      actualResults,
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
    });
  };

  // Function to handle winner selection
  const handleWinnerSelection = (fightIndex: number, fighter: string) => {
    const newWinners = [...actualWinners];
    newWinners[fightIndex] = fighter;
    setActualWinners(newWinners);
  };

  // Render functions
  return (
    <div className={styles.parlayContainer}>
      <Link href="/" className={styles.parlayBackButton}>
        <ArrowLeftCircle className={styles.icon} />
        Back to Dashboard
      </Link>
      <div className={styles.parlayHeader}>
        <h1>Parlay Generator</h1>
        <p>Create your own betting strategy based on custom probabilities.</p>
      </div>

      <div className={styles.parlayFightsContainer}>
        {fights.map((fight, index) => {
          const odds1 = parseFloat(fight.odds_f1);
          const odds2 = parseFloat(fight.odds_f2);
          return (
            <div key={index} className={styles.parlayFightCard}>
              <h3>{fight.Fighter} vs {fight.Opponent}</h3>
              <div className={styles.parlayOddsDisplay}>
                <div className={styles.parlayFighter}>
                  <div
                    className={`${styles.parlayFighterName} ${actualWinners[index] === fight.Fighter ? styles.parlayFighterNameSelected : ''}`}
                    onClick={() => handleWinnerSelection(index, fight.Fighter)}
                  >
                    {fight.Fighter}
                  </div>
                  <div className={styles.parlayFighterOdds}>{fight.odds_f1}</div>
                </div>
                <div className={styles.parlayFighter}>
                  <div
                    className={`${styles.parlayFighterName} ${actualWinners[index] === fight.Opponent ? styles.parlayFighterNameSelected : ''}`}
                    onClick={() => handleWinnerSelection(index, fight.Opponent)}
                  >
                    {fight.Opponent}
                  </div>
                  <div className={styles.parlayFighterOdds}>{fight.odds_f2}</div>
                </div>
              </div>
              <div className={styles.parlaySliderContainer}>
                <label className={styles.parlaySliderLabel}>{fight.Fighter}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customProbs[index][1]} // Opponent's confidence
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const newProbs = [...customProbs];
                    newProbs[index][1] = value;
                    newProbs[index][0] = 100 - value;
                    setCustomProbs(newProbs);
                  }}
                  className={styles.parlaySliderInput}
                />
                <label className={styles.parlaySliderLabel}>{fight.Opponent}</label>
                <div className={styles.parlayConfidenceDisplay}>
                  {customProbs[index][0].toFixed(2)}% / {customProbs[index][1].toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.parlaySettingsContainer}>
        {/* Parlay Risk Level */}
        <div>
          <label className={styles.parlaySettingsLabel}>Parlay Risk Level (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={parlayRisk}
            onChange={(e) => setParlayRisk(parseInt(e.target.value))}
            className={styles.parlaySettingsRange}
          />
          <input
            type="number"
            min="1"
            max="10"
            value={parlayRisk}
            onChange={(e) => setParlayRisk(parseInt(e.target.value))}
            className={styles.parlaySettingsInput}
          />
        </div>
        {/* Bet Size Risk Level */}
        <div>
          <label className={styles.parlaySettingsLabel}>Bet Size Risk Level (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={betSizeRisk}
            onChange={(e) => setBetSizeRisk(parseInt(e.target.value))}
            className={styles.parlaySettingsRange}
          />
          <input
            type="number"
            min="1"
            max="10"
            value={betSizeRisk}
            onChange={(e) => setBetSizeRisk(parseInt(e.target.value))}
            className={styles.parlaySettingsInput}
          />
        </div>
        {/* Number of Bets */}
        <div>
          <label className={styles.parlaySettingsLabel}>Number of Bets (1-20)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={numBets}
            onChange={(e) => setNumBets(parseInt(e.target.value))}
            className={styles.parlaySettingsInput}
          />
        </div>
        {/* Bankroll */}
        <div>
          <label className={styles.parlaySettingsLabel}>Bankroll ($)</label>
          <input
            type="number"
            min="1"
            value={bankroll}
            onChange={(e) => setBankroll(parseFloat(e.target.value))}
            className={styles.parlaySettingsInput}
          />
        </div>
        {/* Strategy */}
        <div>
          <label className={styles.parlaySettingsLabel}>Betting Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className={styles.parlaySettingsSelect}
          >
            <option value="kelly">Kelly Criterion</option>
            <option value="quarterKelly">Quarter Kelly</option>
            <option value="fixedRisk">Fixed Risk</option>
          </select>
        </div>
      </div>

      <div className={styles.parlayButtonsContainer}>
        <button onClick={simulateBets} className={styles.parlayButton}>
          Calculate Bets
        </button>
        {/* Add Find Optimal button if needed */}
        <button onClick={calculateActualReturn} className={styles.parlayButton}>
          Calculate Actual Return
        </button>
      </div>

      {resultData && (
        <div className={styles.parlayResultsContainer}>
          <h2>Recommended Bets</h2>
          {/* Display recommended bets */}
          {resultData.selectedBets.map((bet, index) => (
            <div key={index} className={styles.parlayBetCard}>
              <p>Fighters: {bet.fighters}</p>
              <p>Odds: {bet.odds}</p>
              <p>Your Confidence: {(bet.customProb * 100).toFixed(2)}%</p>
              <p>Bet Amount: ${bet.betAmount.toFixed(2)}</p>
              <p>Expected Value: ${bet.expectedValue.toFixed(2)}</p>
              <p>Payout: ${bet.payout.toFixed(2)}</p>
            </div>
          ))}
          {/* Display statistics */}
          <h2>Statistics</h2>
          <p>Number of Bets: {resultData.totalBets}</p>
          <p>Total Bets Cost: ${resultData.totalBetsCost.toFixed(2)}</p>
          <p>Total Expected Value: ${resultData.totalExpectedValue.toFixed(2)}</p>
          <p>Total Expected Payout: ${resultData.totalExpectedPayout.toFixed(2)}</p>
          <p>Max Payout: ${resultData.maxPayout.toFixed(2)}</p>
          <p>ROI: {resultData.roi.toFixed(2)}%</p>
        </div>
      )}

      {actualReturn && (
        <div className={styles.parlayActualReturnContainer}>
          <h2>Actual Return</h2>
          {/* Display actual results */}
          {actualReturn.actualResults.map((result: any, index: number) => (
            <div key={index} className={styles.parlayResultCard}>
              <p>Bet: {result.bet.fighters}</p>
              <p>Result: {result.won ? 'Win' : 'Loss'}</p>
              <p>Payout: ${result.won ? result.bet.payout.toFixed(2) : '0.00'}</p>
            </div>
          ))}
          <p>Total Return: ${actualReturn.totalReturn.toFixed(2)}</p>
          <p>Net Profit: ${actualReturn.netProfit.toFixed(2)}</p>
          <p>ROI: {actualReturn.roi.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
