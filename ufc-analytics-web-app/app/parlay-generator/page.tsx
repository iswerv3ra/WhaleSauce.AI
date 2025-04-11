'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle } from 'react-feather';
import ParlayGenerator from '../../components/ParlayGenerator';
import Link from 'next/link';
import Papa from 'papaparse';
import styles from './ParlayGenerator.module.css';

// Custom Dropdown Component
interface StrategyOption {
  value: string;
  label: string;
  description: string;
}

interface CustomDropdownProps {
  options: StrategyOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className={styles.customDropdown}>
      <div
        className={styles.customDropdownSelected}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.label}
        <span className={styles.customDropdownTooltip}>
          {selectedOption?.description}
        </span>
      </div>
      {isOpen && (
        <div className={styles.customDropdownOptions}>
          {options.map((option) => (
            <div
              key={option.value}
              className={styles.customDropdownOption}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component Interfaces
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

interface PotentialBet {
  fighter: string;
  odds: number;
  customProb: number;
  fightIndex: number;
}

export default function ParlayGeneratorPage() {
  const [fights, setFights] = useState<Fight[]>([]);
  const [parlayRisk, setParlayRisk] = useState(5);
  const [betSizeRisk, setBetSizeRisk] = useState(5);
  const [numBets, setNumBets] = useState(5);
  const [bankroll, setBankroll] = useState(1000);
  const [strategy, setStrategy] = useState('fixedRisk');
  const [fixedBetAmount, setFixedBetAmount] = useState(10);
  const [customProbs, setCustomProbs] = useState<number[][]>([]);
  const [recommendedBets, setRecommendedBets] = useState<Bet[]>([]);
  const [mostLikelyBets, setMostLikelyBets] = useState<Bet[]>([]);
  const [resultData, setResultData] = useState<Result | null>(null);
  const [actualWinners, setActualWinners] = useState<string[]>([]);
  const [actualReturn, setActualReturn] = useState<any>(null);

  useEffect(() => {
    // Fetch and parse bovada_fighters_odds.csv
    fetch('/data/bovada_fighters_odds.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<Fight>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filteredData = results.data.filter(
              (item) => item && item.Fighter && item.Opponent
            );
            setFights(filteredData); // Display all fights
            // Initialize custom probabilities and actual winners
            const initialProbs = filteredData.map(() => [50, 50]); // Default 50-50 confidence
            setCustomProbs(initialProbs);
            setActualWinners(filteredData.map(() => ''));
          },
        });
      });
  }, []);

  // Helper functions for calculations
  const americanToDecimal = (odds: number) => {
    if (odds > 0) {
      return 1 + odds / 100;
    } else {
      return 1 + 100 / Math.abs(odds);
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
    } else if (decimal > 1.0) {
      return `-${Math.round(100 / (decimal - 1))}`;
    } else {
      return 'Invalid odds';
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
    1: { maxLegs: 2 },
    2: { maxLegs: 3 },
    3: { maxLegs: 5 },
    4: { maxLegs: 6 },
    5: { maxLegs: 7 },
    6: { maxLegs: 8 },
    7: { maxLegs: 9 },
    8: { maxLegs: 10 },
    9: { maxLegs: 11 },
    10: { maxLegs: 13 },
  };

  const betSizeRiskMapping = {
    1: { betFraction: 0.05 },
    2: { betFraction: 0.1 },
    3: { betFraction: 0.15 },
    4: { betFraction: 0.2 },
    5: { betFraction: 0.25 },
    6: { betFraction: 0.3 },
    7: { betFraction: 0.35 },
    8: { betFraction: 0.4 },
    9: { betFraction: 0.45 },
    10: { betFraction: 0.5 },
  };

  // Define strategies with detailed descriptions
  const strategies = [
    // Existing strategies
    {
      value: 'kelly',
      label: 'Kelly Criterion',
      description:
        'Calculates the optimal bet size based on your confidence levels to maximize long-term growth. Higher confidence increases the bet size.',
    },
    {
      value: 'halfKelly',
      label: 'Half Kelly',
      description:
        'Bets half of the Kelly Criterion amount, balancing growth and risk. Your confidence levels still influence the bet size, but risk is reduced.',
    },
    {
      value: 'quarterKelly',
      label: 'Quarter Kelly',
      description:
        'Bets a quarter of the Kelly Criterion amount for a more conservative approach. Your confidence affects bet size minimally.',
    },
    {
      value: 'fixedRisk',
      label: 'Fixed Risk',
      description:
        'Bets a fixed percentage of your bankroll based on your Bet Size Risk Level. Bet sizes are independent of your confidence levels.',
    },
    {
      value: 'fixedAmount',
      label: 'Fixed Amount',
      description:
        'Bets a fixed amount on each parlay, specified by you. Bet sizes do not vary based on your confidence levels.',
    },
    // New strategies
    {
      value: 'allFavorites',
      label: 'All Favorites',
      description:
        'Generates parlays using the most favored fighters based on the lowest odds.',
    },
    {
      value: 'allUnderdogs',
      label: 'All Underdogs',
      description:
        'Generates parlays using underdog fighters based on the highest odds.',
    },
    {
      value: 'confidenceVsOdds',
      label: 'Confidence vs. Odds',
      description:
        'Creates parlays where your confidence significantly exceeds the implied probability from the odds.',
    },
    {
      value: 'mixedStrategy',
      label: 'Mixed Favorites and Underdogs',
      description:
        'Combines favorites and underdogs in parlays based on your confidence levels to balance risk and reward.',
    },
    {
      value: 'oddsBasedConfidence',
      label: 'Odds-Based Confidence Weighting',
      description:
        'Generates parlays by weighting your confidence levels against the actual odds.',
    },
  ];

  // Main calculation function
  const simulateBets = () => {
    const maxLegs =
      parlayRiskMapping[parlayRisk as keyof typeof parlayRiskMapping].maxLegs;
    const betFraction =
      betSizeRiskMapping[betSizeRisk as keyof typeof betSizeRiskMapping]
        .betFraction;

    let bets: Bet[] = [];
    let uniqueBets = new Set();

    // Generate potential bets
    let potentialBets: PotentialBet[] = [];

    for (let i = 0; i < fights.length; i++) {
      const fight = fights[i];
      const fighter1Prob = customProbs[i][0] / 100;
      const fighter2Prob = customProbs[i][1] / 100;
      const odds1 = parseFloat(fight.odds_f1);
      const odds2 = parseFloat(fight.odds_f2);
      const impliedProb1 = oddsToImpliedProbability(odds1);
      const impliedProb2 = oddsToImpliedProbability(odds2);

      // Add both fighters as potential bets with their respective data
      potentialBets.push(
        {
          fighter: fight.Fighter,
          odds: odds1,
          customProb: fighter1Prob,
          fightIndex: i,
        },
        {
          fighter: fight.Opponent,
          odds: odds2,
          customProb: fighter2Prob,
          fightIndex: i,
        }
      );
    }

    // Filter potential bets based on strategy
    let filteredBets: PotentialBet[] = [];

    switch (strategy) {
      case 'allFavorites':
        // Select fighters with the lowest odds (favorites)
        filteredBets = potentialBets.filter((bet) => {
          const fightBets = potentialBets.filter(
            (b) => b.fightIndex === bet.fightIndex
          );
          const minOdds = Math.min(...fightBets.map((b) => b.odds));
          return bet.odds === minOdds;
        });
        break;

      case 'allUnderdogs':
        // Select fighters with the highest odds (underdogs)
        filteredBets = potentialBets.filter((bet) => {
          const fightBets = potentialBets.filter(
            (b) => b.fightIndex === bet.fightIndex
          );
          const maxOdds = Math.max(...fightBets.map((b) => b.odds));
          return bet.odds === maxOdds;
        });
        break;

      case 'confidenceVsOdds':
        // Select bets where user's confidence exceeds implied probability by a threshold
        filteredBets = potentialBets.filter(
          (bet) => bet.customProb - oddsToImpliedProbability(bet.odds) > 0.1 // Threshold of 10%
        );
        break;

      case 'mixedStrategy':
        // Mix favorites and underdogs based on confidence
        filteredBets = potentialBets.filter((bet) => {
          const fightIndex = bet.fightIndex;
          const otherBet = potentialBets.find(
            (b) => b.fightIndex === fightIndex && b.fighter !== bet.fighter
          );
          // Select favorite if confidence is high, underdog if confidence is low but higher than the other fighter
          if (bet.customProb > 0.6) {
            // Prefer favorites
            return bet.odds <= otherBet!.odds;
          } else if (bet.customProb > otherBet!.customProb) {
            // Prefer underdogs with higher confidence
            return bet.odds > otherBet!.odds;
          }
          return false;
        });
        break;

      case 'oddsBasedConfidence':
        // Weight confidence against odds
        filteredBets = potentialBets.filter((bet) => {
          const weight = bet.customProb / oddsToImpliedProbability(bet.odds);
          return weight > 1;
        });
        break;

      default:
        // Default behavior (e.g., kelly, fixedRisk, etc.)
        filteredBets = potentialBets.filter(
          (bet) => bet.customProb > oddsToImpliedProbability(bet.odds)
        );
        break;
    }

    // Generate all possible combinations up to maxLegs without repeating fights
    for (let legs = 1; legs <= maxLegs; legs++) {
      const combinations = getCombinations(filteredBets, legs);
      for (let combo of combinations) {
        // Ensure no two bets are from the same fight
        const fightIndices = combo.map((bet) => bet.fightIndex);
        const uniqueFightIndices = new Set(fightIndices);
        if (fightIndices.length !== uniqueFightIndices.size) {
          continue; // Skip combinations with bets from the same fight
        }

        // Create a unique key to prevent duplicates
        const betKey = combo
          .map((bet) => `${bet.fighter}:${bet.odds}`)
          .join('|');
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
        } else if (strategy === 'halfKelly') {
          const kelly_f = calculateKelly(totalProb, totalOdds);
          baseBetAmount = kelly_f * bankroll * 0.5;
        } else if (strategy === 'quarterKelly') {
          const kelly_f = calculateKelly(totalProb, totalOdds);
          baseBetAmount = kelly_f * bankroll * 0.25;
        } else if (strategy === 'fixedAmount') {
          baseBetAmount = fixedBetAmount;
        } else {
          baseBetAmount = bankroll * betFraction;
        }

        // Ensure betAmount is positive and within bankroll
        let betAmount = Math.max(baseBetAmount, 0);
        betAmount = Math.min(betAmount, bankroll);

        // Calculate Expected Value
        const expectedValue = (totalProb * totalOdds - 1) * betAmount;

        // Calculate Payout
        const payout = totalOdds * betAmount;

        bets.push({
          fighters: combo.map((bet) => bet.fighter).join(' & '),
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
    const betsByEV = [...bets].sort((a, b) => b.expectedValue - a.expectedValue);
    const selectedBetsByEV = betsByEV.slice(0, numBets);

    // Sort bets by Total Probability descending
    const betsByProb = [...bets].sort((a, b) => b.customProb - a.customProb);
    const selectedBetsByProb = betsByProb.slice(0, numBets);

    // Calculate statistics for EV bets
    const totalBets = selectedBetsByEV.length;
    const totalBetsCost = selectedBetsByEV.reduce(
      (sum, bet) => sum + bet.betAmount,
      0
    );
    const totalExpectedValue = selectedBetsByEV.reduce(
      (sum, bet) => sum + bet.expectedValue,
      0
    );
    const totalExpectedPayout = selectedBetsByEV.reduce(
      (sum, bet) => sum + bet.payout,
      0
    );
    const roi =
      totalBetsCost > 0 ? (totalExpectedValue / totalBetsCost) * 100 : 0;
    const maxPayout = totalExpectedPayout;

    const result: Result = {
      roi: parseFloat(roi.toFixed(2)),
      totalBets,
      totalBetsCost: parseFloat(totalBetsCost.toFixed(2)),
      totalExpectedValue: parseFloat(totalExpectedValue.toFixed(2)),
      totalExpectedPayout: parseFloat(totalExpectedPayout.toFixed(2)),
      maxPayout: parseFloat(maxPayout.toFixed(2)),
      selectedBets: selectedBetsByEV,
    };

    setRecommendedBets(selectedBetsByEV);
    setMostLikelyBets(selectedBetsByProb);
    setResultData(result);
  };

  // Helper function to get valid combinations without repeating fights
  const getCombinations = (
    array: PotentialBet[],
    length: number
  ): PotentialBet[][] => {
    function* doCombination(
      offset: number,
      combo: PotentialBet[]
    ): Generator<PotentialBet[]> {
      if (combo.length === length) {
        yield combo;
        return;
      }
      for (let i = offset; i < array.length; i++) {
        const newCombo = combo.concat(array[i]);
        const fightIndices = newCombo.map((b) => b.fightIndex);
        const uniqueFightIndices = new Set(fightIndices);
        if (fightIndices.length !== uniqueFightIndices.size) {
          continue; // Skip combinations with bets from the same fight
        }
        yield* doCombination(i + 1, newCombo);
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
        let fightIndex = fights.findIndex(
          (fight) => fight.Fighter === fighter || fight.Opponent === fighter
        );
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
        <ParlayGenerator/>
      </div>

      <div className={styles.parlayFightsContainer}>
        {fights.map((fight, index) => {
          return (
            <div key={index} className={styles.parlayFightCard}>
              <h3>
                {fight.Fighter} vs {fight.Opponent}
              </h3>
              {/* Odds Display */}
              <div className={styles.parlayOddsDisplay}>
                <div className={styles.parlayFighter}>
                  <div
                    className={`${styles.parlayFighterName} ${
                      actualWinners[index] === fight.Fighter
                        ? styles.parlayFighterNameSelected
                        : ''
                    }`}
                    onClick={() => handleWinnerSelection(index, fight.Fighter)}
                  >
                    {fight.Fighter}
                  </div>
                  <div className={styles.parlayFighterOdds}>
                    {fight.odds_f1}
                  </div>
                </div>
                <div className={styles.parlayFighter}>
                  <div
                    className={`${styles.parlayFighterName} ${
                      actualWinners[index] === fight.Opponent
                        ? styles.parlayFighterNameSelected
                        : ''
                    }`}
                    onClick={() => handleWinnerSelection(index, fight.Opponent)}
                  >
                    {fight.Opponent}
                  </div>
                  <div className={styles.parlayFighterOdds}>
                    {fight.odds_f2}
                  </div>
                </div>
              </div>
              {/* Slider */}
              <div className={styles.parlaySliderContainer}>
                <div className={styles.parlaySliderLabels}>
                  <label className={styles.parlaySliderLabel}>
                    {fight.Fighter} ({customProbs[index][0].toFixed(0)}%)
                  </label>
                  <label className={styles.parlaySliderLabel}>
                    {fight.Opponent} ({customProbs[index][1].toFixed(0)}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customProbs[index][1]} // Right fighter's confidence
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const newProbs = [...customProbs];
                    newProbs[index][1] = value;
                    newProbs[index][0] = 100 - value;
                    setCustomProbs(newProbs);
                  }}
                  className={styles.parlaySliderInput}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.parlaySettingsContainer}>
        {/* Parlay Risk Level */}
        <div>
          <label
            className={styles.parlaySettingsLabel}
            title="Determines the maximum number of legs in your parlays. Higher risk allows for more legs, increasing potential payout but reducing the chance of winning."
          >
            Parlay Risk Level (1-10)
          </label>
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
          <label
            className={styles.parlaySettingsLabel}
            title="Determines the fraction of your bankroll to bet on each parlay. Higher risk levels will bet a larger fraction of your bankroll."
          >
            Bet Size Risk Level (1-10)
          </label>
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
          <label
            className={styles.parlaySettingsLabel}
            title="The number of bets to generate."
          >
            Number of Bets (1-50)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={numBets}
            onChange={(e) => setNumBets(parseInt(e.target.value))}
            className={styles.parlaySettingsInput}
          />
        </div>
        {/* Bankroll */}
        <div>
          <label
            className={styles.parlaySettingsLabel}
            title="Your total betting bankroll."
          >
            Bankroll ($)
          </label>
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
          <label
            className={styles.parlaySettingsLabel}
            title="Selects the strategy for determining bet sizes."
          >
            Betting Strategy
          </label>
          <CustomDropdown
            options={strategies}
            selectedValue={strategy}
            onChange={(value) => setStrategy(value)}
          />
          <p className={styles.strategyDescription}>
            {strategies.find((opt) => opt.value === strategy)?.description}
          </p>
        </div>
        {/* Fixed Amount Input */}
        {strategy === 'fixedAmount' && (
          <div>
            <label
              className={styles.parlaySettingsLabel}
              title="Specify a fixed amount to bet on each parlay."
            >
              Fixed Bet Amount ($)
            </label>
            <input
              type="number"
              min="1"
              value={fixedBetAmount}
              onChange={(e) =>
                setFixedBetAmount(parseFloat(e.target.value))
              }
              className={styles.parlaySettingsInput}
            />
          </div>
        )}
      </div>

      <div className={styles.parlayButtonsContainer}>
        <button onClick={simulateBets} className={styles.parlayButton}>
          Calculate Bets
        </button>
        <button onClick={calculateActualReturn} className={styles.parlayButton}>
          Calculate Actual Return
        </button>
      </div>

      {resultData && (
        <div className={styles.parlayResultsContainer}>
          {/* Wrap each section in a column */}
          <div className={styles.parlayResultsColumn}>
            <h2>Highest Expected Value Parlays</h2>
            {/* Display recommended bets */}
            {recommendedBets.map((bet, index) => (
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
            <p>
              Total Expected Value: ${resultData.totalExpectedValue.toFixed(2)}
            </p>
            <p>
              Total Expected Payout: $
              {resultData.totalExpectedPayout.toFixed(2)}
            </p>
            <p>Max Payout: ${resultData.maxPayout.toFixed(2)}</p>
            <p>ROI: {resultData.roi.toFixed(2)}%</p>
          </div>

          <div className={styles.parlayResultsColumn}>
            {/* Most Likely Parlays */}
            <h2>Most Likely Parlays</h2>
            {mostLikelyBets.map((bet, index) => (
              <div key={index} className={styles.parlayBetCard}>
                <p>Fighters: {bet.fighters}</p>
                <p>Odds: {bet.odds}</p>
                <p>
                  Total Probability: {(bet.customProb * 100).toFixed(2)}%
                </p>
                <div className={styles.probabilityBarContainer}>
                  <div
                    className={styles.probabilityBar}
                    style={{ width: `${bet.customProb * 100}%` }}
                  ></div>
                </div>
                <p>Bet Amount: ${bet.betAmount.toFixed(2)}</p>
                <p>Payout: ${bet.payout.toFixed(2)}</p>
              </div>
            ))}
          </div>
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
              <p>
                Payout: ${result.won ? result.bet.payout.toFixed(2) : '0.00'}
              </p>
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
