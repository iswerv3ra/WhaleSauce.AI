import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import styles from './ParlayGenerator.module.css';


const ParlayGenerator: React.FC = () => {
  const [fighters, setFighters] = useState<any[]>([]);
  const [fights, setFights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numFights, setNumFights] = useState<number>(3); // Default to 3 fights
  const [parlay, setParlay] = useState<any[]>([]);
  const [totalPayout, setTotalPayout] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Clear any previous errors
        const [fighterResponse, fightResponse] = await Promise.all([
          fetch('/data/fighter_total_stats.csv'),
          fetch('/data/fight_with_stats.csv'),
        ]);

        const fighterCsvData = await fighterResponse.text();
        const fightCsvData = await fightResponse.text();

        // Parse fighter data
        Papa.parse(fighterCsvData, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => {
            return header.trim();
          },
          complete: (results) => {
            setFighters(results.data);
          },
          error: (error) => {
            setError('Error parsing fighter CSV: ' + error.message);
          },
        });

        // Parse fight data
        Papa.parse(fightCsvData, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => {
            return header.trim();
          },
          complete: (results) => {
            setFights(results.data);
          },
          error: (error) => {
            setError('Error parsing fight CSV: ' + error.message);
          },
        });

        setLoading(false);
      } catch (err: any) {
        setError('Error fetching CSV data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    // Helper function to normalize a value to a 0-1 scale
    const normalize = (value: number, min: number, max: number): number => {
      if (max - min === 0) {
        return 0.5; // Avoid division by zero if min and max are the same
      }
      return (value - min) / (max - min);
    };
  
    const calculateWinProbability = (fight: any, fighters: any[]) => {
      // Define the weights for each statistic
      const winPercentageWeight = 0.2;
      const strikingAccuracyWeight = 0.15;
      const takedownAccuracyWeight = 0.15;
      const strikingDefenseWeight = 0.15;
      const takedownDefenseWeight = 0.15;
      const avgFightTimeWeight = 0.2;
  
      // Retrieve the fighters based on the fight data
      const fighter1 = fighters.find((f) => f.FIGHTER === fight.FIGHTER);
      const fighter2 = fighters.find((f) => f.FIGHTER === fight.OPPONENT);
  
      if (!fighter1 || !fighter2) {
        return {
          F1_winProbability: 0.5,
          F2_winProbability: 0.5
        }
      }
  
      // Helper function to safely retrieve and default to 0 if undefined or NaN
      const getValue = (fighter: any, key: string) => {
        const value = parseFloat(fighter[key]);
        return isNaN(value) ? 0 : value;
      };
  
      // Extract statistics for fighter 1
      const F1_winPercentage = getValue(fighter1, 'WinPercentage');
      const F1_strikingAccuracy = getValue(fighter1, 'SIG_STR_ACC_fighter');
      const F1_takedownAccuracy = getValue(fighter1, 'TD_ACC_fighter');
      const F1_strikingDefense = getValue(fighter1, 'SIG_STR_DEF_fighter');
      const F1_takedownDefense = getValue(fighter1, 'TD_DEF_fighter');
      const F1_avgFightTime = getValue(fighter1, 'AVG_FIGHT_TIME_MINS');
  
      // Extract statistics for fighter 2
      const F2_winPercentage = getValue(fighter2, 'WinPercentage');
      const F2_strikingAccuracy = getValue(fighter2, 'SIG_STR_ACC_fighter');
      const F2_takedownAccuracy = getValue(fighter2, 'TD_ACC_fighter');
      const F2_strikingDefense = getValue(fighter2, 'SIG_STR_DEF_fighter');
      const F2_takedownDefense = getValue(fighter2, 'TD_DEF_fighter');
      const F2_avgFightTime = getValue(fighter2, 'AVG_FIGHT_TIME_MINS');
  
      // Normalize statistics
      const normalizedF1_winPercentage = normalize(F1_winPercentage, 0, 100);
      const normalizedF1_strikingAccuracy = normalize(F1_strikingAccuracy, 0, 100);
      const normalizedF1_takedownAccuracy = normalize(F1_takedownAccuracy, 0, 100);
      const normalizedF1_strikingDefense = normalize(F1_strikingDefense, 0, 100);
      const normalizedF1_takedownDefense = normalize(F1_takedownDefense, 0, 100);
      const normalizedF1_avgFightTime = normalize(F1_avgFightTime, 0, 30);
  
      const normalizedF2_winPercentage = normalize(F2_winPercentage, 0, 100);
      const normalizedF2_strikingAccuracy = normalize(F2_strikingAccuracy, 0, 100);
      const normalizedF2_takedownAccuracy = normalize(F2_takedownAccuracy, 0, 100);
      const normalizedF2_strikingDefense = normalize(F2_strikingDefense, 0, 100);
      const normalizedF2_takedownDefense = normalize(F2_takedownDefense, 0, 100);
      const normalizedF2_avgFightTime = normalize(F2_avgFightTime, 0, 30);
  
      // Calculate the scores for each fighter
      const F1_score = (normalizedF1_winPercentage * winPercentageWeight) +
        (normalizedF1_strikingAccuracy * strikingAccuracyWeight) +
        (normalizedF1_takedownAccuracy * takedownAccuracyWeight) +
        (normalizedF1_strikingDefense * strikingDefenseWeight) +
        (normalizedF1_takedownDefense * takedownDefenseWeight) +
        (normalizedF1_avgFightTime * avgFightTimeWeight);
  
      const F2_score = (normalizedF2_winPercentage * winPercentageWeight) +
        (normalizedF2_strikingAccuracy * strikingAccuracyWeight) +
        (normalizedF2_takedownAccuracy * takedownAccuracyWeight) +
        (normalizedF2_strikingDefense * strikingDefenseWeight) +
        (normalizedF2_takedownDefense * takedownDefenseWeight) +
        (normalizedF2_avgFightTime * avgFightTimeWeight);
  
      // Calculate the win probabilities based on scores
      const F1_winProbability = F1_score / (F1_score + F2_score);
      const F2_winProbability = F2_score / (F1_score + F2_score);
  
      return {
        F1_winProbability,
        F2_winProbability,
      };
    };

    const generateParlay = () => {
      if (fights.length === 0 || numFights <= 0) {
        return;
      }
      const selectedFights = fights.sort(() => 0.5 - Math.random()).slice(0, numFights);
      let parlayPayout = 1; // Initialize to 1 for multiplication
      const parlayData = selectedFights.map((fight) => {
        const { F1_winProbability, F2_winProbability } = calculateWinProbability(fight, fighters)
        const F1_odds = (1 / F1_winProbability).toFixed(2); // Convert to odds
        const F2_odds = (1 / F2_winProbability).toFixed(2) // Convert to odds
        parlayPayout *= F1_odds;
        return {
          bout: fight.BOUT,
          fighter1: fight.FIGHTER,
          fighter2: fight.OPPONENT,
          F1_odds: F1_odds.toFixed(2),
          F2_odds: F2_odds.toFixed(2),
          F1_winProbability: (F1_winProbability * 100).toFixed(2),
          F2_winProbability: (F2_winProbability * 100).toFixed(2),
        };
      });
      setParlay(parlayData);
      setTotalPayout(parlayPayout);
    };

  return (
   <div className={styles.container}>
     {loading && <div className={styles.loading}>Loading data...</div>}
     {error && <div className={styles.error}>Error: {error}</div>}
     {!loading && !error && fighters.length > 0 && fights.length > 0 && (
       <div className={styles.content}>
         <div className={styles.inputContainer}>
           <label className={styles.inputLabel}>Number of Fights:</label>
           <input type="number" className={styles.input} value={numFights} onChange={(e) => setNumFights(Number(e.target.value))} min={1} />
         </div>
         <button className={styles.generateButton} onClick={generateParlay}>Generate Parlay</button>
         <div className={styles.parlayResults}>
           <h2 className={styles.parlayHeader}>Parlay</h2>
           {parlay.map((fight, index) => (
             <div key={index} className={styles.parlayItem}>
               <p className={styles.bout}>{fight.bout}</p>
               <p className={styles.fighterInfo}>
                 {fight.fighter1}: {fight.F1_odds} ({fight.F1_winProbability}%)
               </p>
               <p className={styles.fighterInfo}>
                 {fight.fighter2}: {fight.F2_odds} ({fight.F2_winProbability}%)
               </p>
             </div>
           ))}
         </div>
         {parlay.length > 0 && <p className={styles.payout}>Total Parlay Payout: {totalPayout.toFixed(2)}</p>}
        </div>
      )}
    </div>
  );
};

export default ParlayGenerator;