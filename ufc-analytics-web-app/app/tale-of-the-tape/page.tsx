'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { ArrowLeftCircle } from 'react-feather';
import styles from './TaleOfTheTape.module.css';

interface OddsDataItem {
  Fighter: string;
  Opponent: string;
  event_time: string;
  odds_f1: string;
  odds_f2: string;
}

interface StatsDataItem {
  FIGHTER: string;
  [key: string]: any;
}

interface MatchItem extends OddsDataItem {
  fighterStats: StatsDataItem | null;
  opponentStats: StatsDataItem | null;
}

export default function TaleOfTheTapePage() {
  const [oddsData, setOddsData] = useState<OddsDataItem[]>([]);
  const [statsData, setStatsData] = useState<StatsDataItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    // Fetch and parse bovada_fighters_odds.csv
    fetch('/data/bovada_fighters_odds.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<OddsDataItem>(csvText, {
          header: true,
          skipEmptyLines: true, // Skip empty lines
          complete: results => {
            const filteredData = results.data.filter(
              item => item && item.Fighter && item.Opponent
            );
            setOddsData(filteredData);
          },
        });
      });

    // Fetch and parse fighter_total_stats.csv
    fetch('/data/fighter_total_stats.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<StatsDataItem>(csvText, {
          header: true,
          skipEmptyLines: true, // Skip empty lines
          complete: results => {
            const filteredData = results.data.filter(
              item => item && item.FIGHTER
            );
            setStatsData(filteredData);
          },
        });
      });
  }, []);

  useEffect(() => {
    // Perform matching after data is loaded
    if (oddsData.length > 0 && statsData.length > 0) {
      // Create Fuse instances for fuzzy matching
      const fuseOptions: Fuse.IFuseOptions<StatsDataItem> = {
        keys: ['FIGHTER'],
        threshold: 0.3,
        minMatchCharLength: 2,
      };
      const fighterFuse = new Fuse(statsData, fuseOptions);

      const updatedMatches: MatchItem[] = oddsData
        .map(fight => {
          // Ensure fight.Fighter and fight.Opponent are defined
          const fighterName = fight.Fighter || '';
          const opponentName = fight.Opponent || '';

          const fighterResult = fighterFuse.search(fighterName);
          const opponentResult = fighterFuse.search(opponentName);

          const fighterStats =
            fighterResult.length > 0 ? fighterResult[0].item : null;
          const opponentStats =
            opponentResult.length > 0 ? opponentResult[0].item : null;

          return {
            ...fight,
            fighterStats,
            opponentStats,
          };
        })
        .filter(match => match.fighterStats && match.opponentStats); // Filter out fights without both fighters' stats

      setMatches(updatedMatches);
    }
  }, [oddsData, statsData]);

  const handleFightClick = (match: MatchItem) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMatch(null);
    setSelectedColumns([]);
    setSelectAll(false);
  };

  const handleColumnSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (value === 'selectAll') {
      // Handle Select All checkbox
      setSelectAll(checked);
      if (checked) {
        // Select all columns
        if (statsData.length > 0) {
          const allColumns = Object.keys(statsData[0]);
          setSelectedColumns(allColumns);
        }
      } else {
        // Deselect all columns
        setSelectedColumns([]);
      }
    } else {
      if (checked) {
        setSelectedColumns(prevColumns => [...prevColumns, value]);
      } else {
        setSelectedColumns(prevColumns =>
          prevColumns.filter(col => col !== value)
        );
        setSelectAll(false);
      }
    }
  };

  return (
    <div className={styles.tapeContainer}>
      <Link href="/" className={styles.tapeBackButton}>
        <ArrowLeftCircle className={styles.icon} />
        Back to Dashboard
      </Link>
      <div className={styles.tapeHeader}>
        <h1>Tale of the Tape</h1>
        <p>Compare fighters for upcoming matches with detailed statistics.</p>
      </div>

      {matches.length > 0 ? (
        <div className={styles.tapeTableContainer}>
          <table className={styles.tapeDataTable}>
            <thead>
              <tr>
                <th>Event Time</th>
                <th>Fighter</th>
                <th>Opponent</th>
                <th>Odds (Fighter)</th>
                <th>Odds (Opponent)</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr
                  key={index}
                  className={styles.tapeTableRow}
                  onClick={() => handleFightClick(match)}
                >
                  <td>{match.event_time}</td>
                  <td>{match.Fighter}</td>
                  <td>{match.Opponent}</td>
                  <td>{match.odds_f1}</td>
                  <td>{match.odds_f2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tapeLoadingScreen}>
          <div className={styles.tapeLoader}></div>
        </div>
      )}

      {showModal && selectedMatch && (
        <div className={styles.tapeModalOverlay}>
          <div className={styles.tapeModalContent}>
            <button
              onClick={handleModalClose}
              className={styles.tapeModalCloseButton}
            >
              &times;
            </button>
            <h2>
              {selectedMatch.Fighter} vs {selectedMatch.Opponent}
            </h2>
            <div className={styles.tapeComparisonModalBody}>
              <div className={styles.tapeStatsSelection}>
                <h3>Select Stats to Display</h3>
                <div
                  className={`${styles.tapeStatCheckbox} ${styles.tapeSelectAllCheckbox}`}
                >
                  <input
                    type="checkbox"
                    value="selectAll"
                    checked={selectAll}
                    onChange={handleColumnSelect}
                    className={styles.tapeInputCheckbox}
                  />
                  Select All
                </div>
                <div className={styles.tapeStatsCheckboxes}>
                  {statsData.length > 0 &&
                    Object.keys(statsData[0]).map((col, index) => (
                      <label key={index} className={styles.tapeStatCheckbox}>
                        <input
                          type="checkbox"
                          value={col}
                          checked={selectedColumns.includes(col)}
                          onChange={handleColumnSelect}
                          className={styles.tapeInputCheckbox}
                        />
                        {col}
                      </label>
                    ))}
                </div>
              </div>
              <div className={styles.tapeComparisonTableContainer}>
                <table className={styles.tapeComparisonTable}>
                  <thead>
                    <tr>
                      <th>Stat</th>
                      <th>{selectedMatch.Fighter}</th>
                      <th>{selectedMatch.Opponent}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedColumns.map(col => (
                      <tr key={col}>
                        <td>{col}</td>
                        <td>
                          {selectedMatch.fighterStats
                            ? selectedMatch.fighterStats[col]
                            : 'N/A'}
                        </td>
                        <td>
                          {selectedMatch.opponentStats
                            ? selectedMatch.opponentStats[col]
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className={styles.tapeCustomButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
