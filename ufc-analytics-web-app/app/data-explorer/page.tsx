'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useTable,
  useSortBy,
  usePagination,
  Row as TableRow,
  Column as TableColumn,
  HeaderGroup,
  Cell as TableCell,
  UseSortByOptions,
  UsePaginationOptions,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UsePaginationInstanceProps,
  UsePaginationState,
  UseSortByInstanceProps,
  UseSortByState,
  TableOptions,
} from 'react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeftCircle,
  XCircle,
} from 'lucide-react';
import Papa from 'papaparse';
import Link from 'next/link';
import styles from './DataExplorer.module.css';

// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

// Extend react-table types to include properties from plugins
declare module 'react-table' {
  export interface TableOptions<D extends object = {}>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D> {}

  export interface TableInstance<D extends object = {}>
    extends UsePaginationInstanceProps<D>,
      UsePaginationState<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UsePaginationState<D>,
      UseSortByState<D> {}

  export interface ColumnInterface<D extends object = {}>
    extends UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object = {}>
    extends UseSortByColumnProps<D> {}
}

// Define the FighterDetail interface
interface FighterDetail {
  [key: string]: string | number;
}

// Utility function to determine division based on weight
function getDivision(weight: number): string {
  if (weight <= 125) return 'Flyweight';
  if (weight <= 135) return 'Bantamweight';
  if (weight <= 145) return 'Featherweight';
  if (weight <= 155) return 'Lightweight';
  if (weight <= 170) return 'Welterweight';
  if (weight <= 185) return 'Middleweight';
  if (weight <= 205) return 'Light Heavyweight';
  return 'Heavyweight';
}

// Function to invert fight result
function invertResult(result: string): string {
  if (result === 'Win') return 'Loss';
  if (result === 'Loss') return 'Win';
  return result;
}

// Define chart colors
const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];

// Main Component
export default function DataExplorerPage() {
  // State variables
  const [fighterDetails, setFighterDetails] = useState<FighterDetail[]>([]);
  const [fightStats, setFightStats] = useState<FighterDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'fighters' | 'fights'>('fighters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFight, setSelectedFight] = useState<FighterDetail | null>(null);
  const [selectedFighter, setSelectedFighter] = useState<FighterDetail | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedStance, setSelectedStance] = useState<string>('');

  const [selectedFightersForComparison, setSelectedFightersForComparison] =
    useState<FighterDetail[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showFightStatsModal, setShowFightStatsModal] = useState(false);
  const [showFighterModal, setShowFighterModal] = useState(false);

  // State variables for SearchBox
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Separate state variables for each modal
  const [selectedFightStats, setSelectedFightStats] = useState<string[]>([]);
  const [selectedFighterStats, setSelectedFighterStats] = useState<string[]>([]);
  const [selectedComparisonStats, setSelectedComparisonStats] = useState<string[]>(
    []
  );

  // State variables for charts
  const [fighterHistoricalData, setFighterHistoricalData] = useState<any[]>([]);
  const [comparisonChartData, setComparisonChartData] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fighterResponse, fightResponse] = await Promise.all([
          fetch('/data/fighter_total_stats.csv'),
          fetch('/data/fight_with_stats.csv'),
        ]);

        const fighterCsvData = await fighterResponse.text();
        const fightCsvData = await fightResponse.text();

        // Process fighter data
        Papa.parse(fighterCsvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as FighterDetail[];
            const processedData = processFighterData(data);
            setFighterDetails(processedData);
          },
          error: (error: any) => {
            setError('Error parsing fighter CSV: ' + error.message);
          },
        });

        // Process fight data
        Papa.parse(fightCsvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as FighterDetail[];
            const processedData = processFightData(data);
            setFightStats(processedData);
          },
          error: (error: any) => {
            setError('Error parsing fight CSV: ' + error.message);
          },
        });

        setLoading(false);
      } catch (error: any) {
        setError('Error fetching CSV data: ' + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processFighterData = (data: FighterDetail[]) => {
    const numericFields = [
      'HEIGHT_fighter',
      'WEIGHT_fighter',
      'REACH_fighter',
      'Fights',
      'Win',
      'Loss',
      'Draw',
    ];

    return data.map((fighter) => {
      numericFields.forEach((field) => {
        if (
          fighter[field] !== undefined &&
          fighter[field] !== null &&
          fighter[field] !== ''
        ) {
          fighter[field] = parseFloat(fighter[field] as string);
        } else {
          fighter[field] = 0;
        }
      });

      const totalFights = (fighter['Fights'] as number) || 1;
      const wins = (fighter['Win'] as number) || 0;
      fighter['WinPercentage'] = (wins / totalFights) * 100;

      const weight = fighter['WEIGHT_fighter'] as number;
      fighter['Division'] = getDivision(weight);

      return fighter;
    });
  };

  const processFightData = (data: FighterDetail[]) => {
    // Include any necessary processing for fight data
    return data;
  };

  const divisions = useMemo(() => {
    const divisionsSet = new Set<string>();
    fighterDetails.forEach((fighter) => {
      if (fighter.Division) {
        divisionsSet.add(fighter.Division as string);
      }
    });
    return Array.from(divisionsSet);
  }, [fighterDetails]);

  const stances = useMemo(() => {
    const stancesSet = new Set<string>();
    fighterDetails.forEach((fighter) => {
      if (fighter.STANCE_fighter) {
        stancesSet.add(fighter.STANCE_fighter as string);
      }
    });
    return Array.from(stancesSet);
  }, [fighterDetails]);

  const fighterNames = useMemo(() => {
    return fighterDetails.map((fighter) => fighter.FIGHTER as string);
  }, [fighterDetails]);

  const columns: TableColumn<FighterDetail>[] = useMemo(() => {
    if (view === 'fighters') {
      return [
        {
          Header: 'Fighter',
          accessor: 'FIGHTER',
        },
        {
          Header: 'Division',
          accessor: 'Division',
        },
        {
          Header: 'Stance',
          accessor: 'STANCE_fighter',
        },
        {
          Header: 'Height (in)',
          accessor: 'HEIGHT_fighter',
        },
        {
          Header: 'Weight (lbs)',
          accessor: 'WEIGHT_fighter',
        },
        {
          Header: 'Reach (in)',
          accessor: 'REACH_fighter',
        },
        {
          Header: 'Fights',
          accessor: 'Fights',
        },
        {
          Header: 'Wins',
          accessor: 'Win',
        },
        {
          Header: 'Losses',
          accessor: 'Loss',
        },
        {
          Header: 'Win Percentage',
          accessor: 'WinPercentage',
          Cell: ({ value }: { value: number }) => `${value.toFixed(2)}%`,
        },
      ];
    } else {
      // Subset of fight data columns
      return [
        {
          Header: 'Event',
          accessor: 'EVENT',
        },
        {
          Header: 'Bout',
          accessor: 'BOUT',
        },
        {
          Header: 'Date',
          accessor: 'DATE_Event',
        },
        {
          Header: 'Weight Class',
          accessor: 'WeightClass',
        },
        {
          Header: 'Fighter',
          accessor: 'FIGHTER',
        },
        {
          Header: 'Opponent',
          accessor: 'OPPONENT',
        },
        {
          Header: 'Method',
          accessor: 'METHOD',
        },
        {
          Header: 'Round',
          accessor: 'ROUND',
        },
        {
          Header: 'Time',
          accessor: 'TIME',
        },
      ];
    }
  }, [view]);

  const data = useMemo(() => {
    let currentData = view === 'fighters' ? fighterDetails : fightStats;

    if (searchQuery) {
      if (view === 'fighters') {
        // Filter by fighter name
        currentData = currentData.filter((item) =>
          String(item.FIGHTER).toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Filter over all fields in fights view
        currentData = currentData.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
    }
    if (view === 'fighters') {
      if (selectedDivision) {
        currentData = currentData.filter((item) => item.Division === selectedDivision);
      }
      if (selectedStance) {
        currentData = currentData.filter(
          (item) => item.STANCE_fighter === selectedStance
        );
      }
    }
    return currentData;
  }, [
    view,
    fighterDetails,
    fightStats,
    searchQuery,
    selectedDivision,
    selectedStance,
  ]);

  const handleSelectFighter = (fighter: FighterDetail) => {
    setSelectedFightersForComparison((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (f) => f.FIGHTER === fighter.FIGHTER
      );
      if (isAlreadySelected) {
        // Remove fighter from selection
        return prevSelected.filter((f) => f.FIGHTER !== fighter.FIGHTER);
      } else {
        // Add fighter to selection if less than 3 are selected
        if (prevSelected.length < 3) {
          return [...prevSelected, fighter];
        } else {
          return prevSelected; // Do not add more than 3 fighters
        }
      }
    });
  };

  const handleRemoveFighter = (fighter: FighterDetail) => {
    setSelectedFightersForComparison((prevSelected) =>
      prevSelected.filter((f) => f.FIGHTER !== fighter.FIGHTER)
    );
  };

  const handleClearSelection = () => {
    setSelectedFightersForComparison([]);
  };

  // SearchBox handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    setSearchQuery(value);

    if (value.length > 0) {
      const filteredSuggestions = fighterNames
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      setSearchSuggestions(filteredSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInputValue(suggestion);
    setSearchSuggestions([]);
    setSearchQuery(suggestion);
  };

  // DataTable setup
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable<FighterDetail>(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  // FightStatsModal handlers
  const allFightStats = useMemo(() => {
    if (!selectedFight) return [];
    return Object.keys(selectedFight).filter((key) => key !== 'FIGHTER');
  }, [selectedFight]);

  const fightStatsSelectAll =
    selectedFightStats.length === allFightStats.length && allFightStats.length > 0;

  const handleFightStatsSelectAllChange = () => {
    if (fightStatsSelectAll) {
      setSelectedFightStats([]);
    } else {
      setSelectedFightStats(allFightStats);
    }
  };

  const handleFightStatChange = (stat: string) => {
    setSelectedFightStats((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  useEffect(() => {
    setSelectedFightStats([]);
  }, [selectedFight]);

  // FighterModal handlers
  const allFighterStats = useMemo(() => {
    if (!selectedFighter) return [];
    return Object.keys(selectedFighter).filter((key) => key !== 'FIGHTER');
  }, [selectedFighter]);

  const fighterStatsSelectAll =
    selectedFighterStats.length === allFighterStats.length &&
    allFighterStats.length > 0;

  const handleFighterStatsSelectAllChange = () => {
    if (fighterStatsSelectAll) {
      setSelectedFighterStats([]);
    } else {
      setSelectedFighterStats(allFighterStats);
    }
  };

  const handleFighterStatChange = (stat: string) => {
    setSelectedFighterStats((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  useEffect(() => {
    setSelectedFighterStats([]);
  }, [selectedFighter]);

  // ComparisonModal handlers
  const allComparisonStats = useMemo(() => {
    if (selectedFightersForComparison.length === 0) return [];
    return Object.keys(selectedFightersForComparison[0]).filter(
      (key) => key !== 'FIGHTER' && key !== 'Division'
    );
  }, [selectedFightersForComparison]);

  const comparisonSelectAll =
    selectedComparisonStats.length === allComparisonStats.length &&
    allComparisonStats.length > 0;

  const handleComparisonSelectAllChange = () => {
    if (comparisonSelectAll) {
      setSelectedComparisonStats([]);
    } else {
      setSelectedComparisonStats(allComparisonStats);
    }
  };

  const handleComparisonStatChange = (stat: string) => {
    setSelectedComparisonStats((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  // Adjusted handleRowClick function
  const handleRowClick = (data: FighterDetail) => {
    if (view === 'fights') {
      setSelectedFight(data);
      setShowFightStatsModal(true);
    } else if (view === 'fighters') {
      setSelectedFighter(data);
      setShowFighterModal(true);
    }
  };

  // Function to get fighter's historical data
  const getFighterHistoricalData = (fighterName: string) => {
    const fights = fightStats
      .filter((fight) => fight.FIGHTER === fighterName || fight.OPPONENT === fighterName)
      .map((fight) => {
        const isFighter = fight.FIGHTER === fighterName;
        const result = isFighter ? fight.RESULT : invertResult(fight.RESULT as string);
        const date = fight.DATE_Event as string;
        const significantStrikes = parseInt(
          isFighter ? (fight['SIG_STR._fighter'] as string) : (fight['SIG_STR._opponent'] as string)
        ) || 0;
        const takedowns = parseInt(
          isFighter ? (fight['TD_fighter'] as string) : (fight['TD_opponent'] as string)
        ) || 0;
        return {
          date,
          result,
          significantStrikes,
          takedowns,
        };
      });

    // Sort by date
    fights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return fights;
  };

  // Function to get comparison data
  const getComparisonData = (stats: string[]) => {
    return selectedFightersForComparison.map((fighter) => {
      const data: any = { fighter: fighter.FIGHTER };
      stats.forEach((stat) => {
        data[stat] = parseFloat(fighter[stat] as string) || 0;
      });
      return data;
    });
  };

  // Update fighter historical data when selected fighter changes
  useEffect(() => {
    if (selectedFighter) {
      const data = getFighterHistoricalData(selectedFighter.FIGHTER as string);
      setFighterHistoricalData(data);
    }
  }, [selectedFighter]);

  // Update comparison chart data when selected stats or fighters change
  useEffect(() => {
    if (selectedComparisonStats.length > 0 && selectedFightersForComparison.length > 0) {
      const data = getComparisonData(selectedComparisonStats);
      setComparisonChartData(data);
    } else {
      setComparisonChartData([]);
    }
  }, [selectedComparisonStats, selectedFightersForComparison]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader} />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorScreen}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <ArrowLeftCircle className={styles.icon} />
        Back to Dashboard
      </Link>
      <h1 className={styles.header}>UFC Data Explorer</h1>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => setView('fighters')}
          className={`${styles.customButton} ${view === 'fighters' ? styles.active : ''}`}
        >
          Fighters
        </button>
        <button
          onClick={() => setView('fights')}
          className={`${styles.customButton} ${view === 'fights' ? styles.active : ''}`}
        >
          Fight Stats
        </button>
      </div>

      {/* SearchBox */}
      <div className={styles.searchBox}>
        <input
          type="text"
          onChange={handleSearchChange}
          value={searchInputValue}
          placeholder="Search fighters..."
          className={styles.searchInput}
        />
        {searchSuggestions.length > 0 && (
          <ul className={styles.suggestionsList}>
            {searchSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={styles.suggestionItem}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {view === 'fighters' && (
        <>
          <div className={styles.filtersContainer}>
            <label className={styles.filterLabel}>
              Division:
              <select
                className={styles.filterSelect}
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">All</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.filterLabel}>
              Stance:
              <select
                className={styles.filterSelect}
                value={selectedStance}
                onChange={(e) => setSelectedStance(e.target.value)}
              >
                <option value="">All</option>
                {stances.map((stance) => (
                  <option key={stance} value={stance}>
                    {stance}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Selected Fighters Section */}
          <div className={styles.selectedFightersContainer}>
            <h3>Selected Fighters:</h3>
            <div className={styles.selectedFighters}>
              {selectedFightersForComparison.map((fighter) => (
                <div key={fighter.FIGHTER} className={styles.selectedFighter}>
                  <span>{fighter.FIGHTER}</span>
                  <button
                    className={styles.removeFighterButton}
                    onClick={() => handleRemoveFighter(fighter)}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
              {selectedFightersForComparison.length > 0 && (
                <button
                  className={styles.clearSelectionButton}
                  onClick={handleClearSelection}
                >
                  Clear All
                </button>
              )}
            </div>
            <button
              onClick={() => setShowComparisonModal(true)}
              disabled={selectedFightersForComparison.length < 2}
              className={styles.customButton}
            >
              Compare
            </button>
          </div>
        </>
      )}

      {/* DataTable */}
      <div className={styles.tableContainer}>
        <table {...getTableProps()} className={styles.dataTable}>
          <thead>
            {headerGroups.map((headerGroup: HeaderGroup<FighterDetail>) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {view === 'fighters' && (
                  <th className={styles.tableHeader}>Select</th>
                )}
                {headerGroup.headers.map((column: ColumnInstance<FighterDetail>) => (
                  <th {...column.getHeaderProps()} className={styles.tableHeader}>
                    <div
                      {...column.getSortByToggleProps()}
                      className={styles.headerContent}
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ChevronDown className={styles.sortIcon} />
                          ) : (
                            <ChevronUp className={styles.sortIcon} />
                          )
                        ) : (
                          ''
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: TableRow<FighterDetail>) => {
              prepareRow(row);
              const isSelected = selectedFightersForComparison.some(
                (f) => f.FIGHTER === row.original.FIGHTER
              );
              return (
                <tr
                  {...row.getRowProps()}
                  className={`${styles.tableRow} ${
                    isSelected ? styles.selectedRow : ''
                  }`}
                  onClick={() => handleRowClick(row.original)}
                >
                  {view === 'fighters' && (
                    <td className={styles.tableCell}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectFighter(row.original);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={
                          !isSelected && selectedFightersForComparison.length >= 3
                        }
                        className={styles.inputCheckbox}
                      />
                    </td>
                  )}
                  {row.cells.map((cell: TableCell<FighterDetail>) => (
                    <td {...cell.getCellProps()} className={styles.tableCell}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className={styles.pagination}>
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className={styles.paginationButton}
          >
            <ChevronsLeft />
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className={styles.paginationButton}
          >
            <ChevronLeft />
          </button>
          <span>
            Page <strong>{pageIndex + 1}</strong> of{' '}
            <strong>{pageOptions.length}</strong>
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className={styles.paginationButton}
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className={styles.paginationButton}
          >
            <ChevronsRight />
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
            className={styles.paginationSelect}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Single Fighter Modal */}
      {showFighterModal && selectedFighter && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowFighterModal(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedFighter.FIGHTER} - Stats</h2>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowFighterModal(false)}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <div className={styles.modalBody}>
              <div className={styles.statsSelection}>
                <h3>Select Stats to View:</h3>
                <label className={styles.statCheckbox}>
                  <input
                    type="checkbox"
                    checked={fighterStatsSelectAll}
                    onChange={handleFighterStatsSelectAllChange}
                    className={styles.inputCheckbox}
                  />
                  Select All
                </label>
                <div className={styles.statsCheckboxes}>
                  {allFighterStats.map((stat) => (
                    <label key={stat} className={styles.statCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedFighterStats.includes(stat)}
                        onChange={() => handleFighterStatChange(stat)}
                        className={styles.inputCheckbox}
                      />
                      {stat}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.comparisonTableContainer}>
                {selectedFighterStats.length > 0 ? (
                  <table className={styles.statsTable}>
                    <tbody>
                      {selectedFighterStats.map((stat) => (
                        <tr key={stat}>
                          <td className={styles.statsKey}>{stat}</td>
                          <td className={styles.statsValue}>
                            {selectedFighter[stat]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Please select at least one stat to view.</p>
                )}
              </div>

              {/* Performance Timeline */}
              <h3>Performance Timeline</h3>
              <div className={styles.chartContainer}>
                {fighterHistoricalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fighterHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="significantStrikes"
                        name="Significant Strikes"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="takedowns"
                        name="Takedowns"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No historical data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fight Stats Modal */}
      {showFightStatsModal && selectedFight && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowFightStatsModal(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Fight Stats</h2>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowFightStatsModal(false)}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <div className={styles.modalBody}>
              <div className={styles.statsSelection}>
                <h3>Select Stats to View:</h3>
                <label className={styles.statCheckbox}>
                  <input
                    type="checkbox"
                    checked={fightStatsSelectAll}
                    onChange={handleFightStatsSelectAllChange}
                    className={styles.inputCheckbox}
                  />
                  Select All
                </label>
                <div className={styles.statsCheckboxes}>
                  {allFightStats.map((stat) => (
                    <label key={stat} className={styles.statCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedFightStats.includes(stat)}
                        onChange={() => handleFightStatChange(stat)}
                        className={styles.inputCheckbox}
                      />
                      {stat}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.comparisonTableContainer}>
                {selectedFightStats.length > 0 ? (
                  <table className={styles.statsTable}>
                    <tbody>
                      {selectedFightStats.map((stat) => (
                        <tr key={stat}>
                          <td className={styles.statsKey}>{stat}</td>
                          <td className={styles.statsValue}>
                            {selectedFight[stat]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Please select at least one stat to view.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div
          className={styles.comparisonModalOverlay}
          onClick={() => setShowComparisonModal(false)}
        >
          <div
            className={styles.comparisonModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Fighter Comparison</h2>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowComparisonModal(false)}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <div className={styles.comparisonModalBody}>
              <div className={styles.statsSelection}>
                <h3>Select Stats to Compare:</h3>
                <label className={styles.statCheckbox}>
                  <input
                    type="checkbox"
                    checked={comparisonSelectAll}
                    onChange={handleComparisonSelectAllChange}
                    className={styles.inputCheckbox}
                  />
                  Select All
                </label>
                <div className={styles.statsCheckboxes}>
                  {allComparisonStats.map((stat) => (
                    <label key={stat} className={styles.statCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedComparisonStats.includes(stat)}
                        onChange={() => handleComparisonStatChange(stat)}
                        className={styles.inputCheckbox}
                      />
                      {stat}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.comparisonTableContainer}>
                {selectedComparisonStats.length > 0 ? (
                  <>
                    <table className={styles.comparisonTable}>
                      <thead>
                        <tr>
                          <th>Stat</th>
                          {selectedFightersForComparison.map((fighter) => (
                            <th key={fighter.FIGHTER}>{fighter.FIGHTER}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedComparisonStats.map((stat) => (
                          <tr key={stat}>
                            <td className={styles.statsKey}>{stat}</td>
                            {selectedFightersForComparison.map((fighter) => (
                              <td key={fighter.FIGHTER} className={styles.statsValue}>
                                {fighter[stat]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Comparison Chart */}
                    <h3>Comparison Chart</h3>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fighter" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {selectedComparisonStats.map((stat, index) => (
                            <Bar
                              key={stat}
                              dataKey={stat}
                              name={stat}
                              fill={chartColors[index % chartColors.length]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <p>Please select at least one stat to compare.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
