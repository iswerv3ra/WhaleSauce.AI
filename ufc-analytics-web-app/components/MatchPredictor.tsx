import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import styles from './MatchPredictor.module.css';

const MatchPredictor: React.FC = () => {

  const [fighters, setFighters] = useState<{[key:string]:any}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fighter1, setFighter1] = useState<string>('');
  const [fighter2, setFighter2] = useState<string>('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [fighter1Score, setFighter1Score] = useState<number>(0);
  const [fighter2Score, setFighter2Score] = useState<number>(0);
  
    // Helper function to normalize data to a 0-1 scale

    const normalize = (value: number, min: number, max: number): number => {
        return max === min ? 0 : (value - min) / (max - min);
    };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/fighter_total_stats.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          complete: (results) => {
              const processedData = results.data.map((fighter:{[key:string]:any}) => {
                for (const key in fighter) {
                  if (typeof fighter[key] === 'string' && !isNaN(Number(fighter[key]))) {
                    fighter[key] = Number(fighter[key]);
                  }
                }return fighter
              })
            setFighters(processedData);
            setLoading(false);
          },
          error: (err) => {
            setError(`Error parsing CSV: ${err.message}`);
            setLoading(false);
          },
        });
      } catch (err: any) {
        setError(`Error fetching data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const predictWinner = () => {
    setPrediction(null);
    if (!fighter1 || !fighter2) return;
  
    const selectedFighter1 = fighters.find((f) => f.FIGHTER === fighter1);
    const selectedFighter2 = fighters.find((f) => f.FIGHTER === fighter2);
  
    if (!selectedFighter1 || !selectedFighter2) {
        setError("One or both fighters not found.");
        return;
    }
  
    const maxValues = {
      WinPercentage: Math.max(...fighters.map((f) => f.WinPercentage || 0)),
      SIG_STR_ACC_fighter: Math.max(...fighters.map((f) => f.SIG_STR_ACC_fighter || 0)),
      TD_ACC_fighter: Math.max(...fighters.map((f) => f.TD_ACC_fighter || 0)),
      SIG_STR_DEF_fighter: Math.max(...fighters.map((f) => f.SIG_STR_DEF_fighter || 0)),
      TD_DEF_fighter: Math.max(...fighters.map((f) => f.TD_DEF_fighter || 0)),
      AVG_FIGHT_TIME_MINS: Math.max(...fighters.map((f) => f.AVG_FIGHT_TIME_MINS || 0)),
    };
    const minValues = {
        WinPercentage: Math.min(...fighters.map((f) => f.WinPercentage || 0)),
        SIG_STR_ACC_fighter: Math.min(...fighters.map((f) => f.SIG_STR_ACC_fighter || 0)),
        TD_ACC_fighter: Math.min(...fighters.map((f) => f.TD_ACC_fighter || 0)),
        SIG_STR_DEF_fighter: Math.min(...fighters.map((f) => f.SIG_STR_DEF_fighter || 0)),
        TD_DEF_fighter: Math.min(...fighters.map((f) => f.TD_DEF_fighter || 0)),
        AVG_FIGHT_TIME_MINS: Math.min(...fighters.map((f) => f.AVG_FIGHT_TIME_MINS || 0)),
      };
  
    const stats = {
      WinPercentage: 0.2,
      SIG_STR_ACC_fighter: 0.15,
      TD_ACC_fighter: 0.15,
      SIG_STR_DEF_fighter: 0.15,
      TD_DEF_fighter: 0.15,
      AVG_FIGHT_TIME_MINS: 0.2,
    };
  
    const calculateScore = (fighter:{[key:string]:any}) => {
        let score = 0;
        for (const stat in stats) {
            const value = fighter[stat] || 0;
            const normalizedValue = normalize(value, minValues[stat], maxValues[stat]);
            score += normalizedValue * stats[stat];
        }
        return score;
    };
  
    const score1 = calculateScore(selectedFighter1);
    const score2 = calculateScore(selectedFighter2);
    setFighter1Score(score1);
    setFighter2Score(score2);
  
    setPrediction(score1 > score2 ? fighter1 : fighter2);
  };

  return (
    <div className={styles.container}>
      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>Error: {error}</div>}
      {!loading && !error && fighters.length > 0 && (
        <div className={styles.content}>
          <div className={styles.selectionContainer}>
            <select
              className={styles.select}
              value={fighter1}
              onChange={(e) => setFighter1(e.target.value)}
            >
              <option value="">Select Fighter 1</option>
              {fighters.map((fighter) => (
                <option key={fighter.FIGHTER} value={fighter.FIGHTER}>
                  {fighter.FIGHTER}
                </option>
              ))}
            </select >
            <select
              className={styles.select}
              value={fighter2}
              onChange={(e) => setFighter2(e.target.value)}
            >
              <option value="">Select Fighter 2</option>
              {fighters.map((fighter) => (
                <option key={fighter.FIGHTER} value={fighter.FIGHTER}>
                  {fighter.FIGHTER}
                </option>
              ))}
            </select >
            <button className={styles.button} onClick={predictWinner} disabled={!fighter1 || !fighter2}>
              Predict
            </button>
          </div>
          {prediction && (
            <div className={styles.resultsContainer}>
              <h3 className={styles.resultsHeader}>Prediction Results:</h3>
              <p>
                {fighter1}: {fighter1Score.toFixed(2)}
              </p>
              <p>
                {fighter2}: {fighter2Score.toFixed(2)}
              </p>
              <p style={{ fontWeight: 'bold' }}>
                Predicted Winner: {prediction}
              </p>
            </div>
          )}
        </div>
      )}
      {!loading && !error && fighters.length === 0 && <div className={styles.noData}>No data Found</div>}
    </div>
  );
};

export default MatchPredictor;