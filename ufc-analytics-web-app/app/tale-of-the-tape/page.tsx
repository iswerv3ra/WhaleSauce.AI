'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { ArrowLeftCircle } from 'react-feather';

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
    <div className="container">
      <Link href="/" className="back-button">
        <ArrowLeftCircle className="icon" />
        Back to Dashboard
      </Link>
      <div className="header">
        <h1>Tale of the Tape</h1>
        <p>Compare fighters for upcoming matches with detailed statistics.</p>
      </div>

      {matches.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Event Time</th>
                <th className="table-cell">Fighter</th>
                <th className="table-cell">Opponent</th>
                <th className="table-cell">Odds (Fighter)</th>
                <th className="table-cell">Odds (Opponent)</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr
                  key={index}
                  className="table-row"
                  onClick={() => handleFightClick(match)}
                >
                  <td className="table-cell">{match.event_time}</td>
                  <td className="table-cell">{match.Fighter}</td>
                  <td className="table-cell">{match.Opponent}</td>
                  <td className="table-cell">{match.odds_f1}</td>
                  <td className="table-cell">{match.odds_f2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      )}

      {showModal && selectedMatch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={handleModalClose}
              className="modal-close-button"
            >
              &times;
            </button>
            <h2>
              {selectedMatch.Fighter} vs {selectedMatch.Opponent}
            </h2>
            <div className="comparison-modal-body">
              <div className="stats-selection">
                <h3>Select Stats to Display</h3>
                <div className="stat-checkbox select-all-checkbox">
                  <input
                    type="checkbox"
                    value="selectAll"
                    checked={selectAll}
                    onChange={handleColumnSelect}
                    className="input-checkbox"
                  />
                  Select All
                </div>
                <div className="stats-checkboxes">
                  {statsData.length > 0 &&
                    Object.keys(statsData[0]).map((col, index) => (
                      <label key={index} className="stat-checkbox">
                        <input
                          type="checkbox"
                          value={col}
                          checked={selectedColumns.includes(col)}
                          onChange={handleColumnSelect}
                          className="input-checkbox"
                        />
                        {col}
                      </label>
                    ))}
                </div>
              </div>
              <div className="comparison-table-container">
                <table className="comparison-table">
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
              className="custom-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
