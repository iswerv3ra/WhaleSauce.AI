"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  Row,
  Column,
  HeaderGroup,
  Cell,
  ColumnInstance,
} from "react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeftCircle,
  XCircle,
} from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

import "./styles.css";

// Extend react-table types to include properties from plugins
declare module "react-table" {
  export interface TableOptions<D extends object = {}>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D>,
      Record<string, any> {}

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
    extends ColumnInterface<D>,
      UseSortByColumnProps<D> {}

  export interface Row<D extends object = {}>
    extends Row<D> {}

  export interface Cell<D extends object = {}>
    extends Cell<D> {}
}

// Define the FighterDetail interface
interface FighterDetail {
  [key: string]: string | number;
}

// Utility function to determine division based on weight
function getDivision(weight: number): string {
  if (weight <= 125) return "Flyweight";
  if (weight <= 135) return "Bantamweight";
  if (weight <= 145) return "Featherweight";
  if (weight <= 155) return "Lightweight";
  if (weight <= 170) return "Welterweight";
  if (weight <= 185) return "Middleweight";
  if (weight <= 205) return "Light Heavyweight";
  return "Heavyweight";
}

// Styles object
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  button: {
    margin: "0 0.5rem",
  },
  searchContainer: {
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  filtersContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "1rem",
    gap: "1rem",
  },
};

// Custom Button Component
function CustomButton({
  onClick,
  isActive,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`custom-button ${isActive ? "active" : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Enhanced SearchBox Component with Autocomplete
function SearchBox({
  onSearch,
  suggestionsData,
}: {
  onSearch: (query: string) => void;
  suggestionsData: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);

    if (value.length > 0) {
      const filteredSuggestions = suggestionsData
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    onSearch(suggestion);
  };

  return (
    <div className="search-box">
      <input
        type="text"
        onChange={handleChange}
        value={inputValue}
        placeholder="Search fighters..."
        className="search-input"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// DataTable Component with Selection
function DataTable({
  columns,
  data,
  selectedFighters,
  onSelectFighter,
  onRowClick,
  view,
}: {
  columns: Column<FighterDetail>[];
  data: FighterDetail[];
  selectedFighters: FighterDetail[];
  onSelectFighter: (fighter: FighterDetail) => void;
  onRowClick: (data: FighterDetail) => void;
  view: "fighters" | "fights";
}) {
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

  return (
    <div className="table-container">
      <table {...getTableProps()} className="data-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<FighterDetail>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {view === "fighters" && (
                <th className="table-header">Select</th>
              )}
              {headerGroup.headers.map(
                (column: ColumnInstance<FighterDetail>) => (
                  <th {...column.getHeaderProps()} className="table-header">
                    <div
                      {...column.getSortByToggleProps()}
                      className="header-content"
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ChevronDown className="sort-icon" />
                          ) : (
                            <ChevronUp className="sort-icon" />
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </th>
                )
              )}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: Row<FighterDetail>) => {
            prepareRow(row);
            const isSelected = selectedFighters.some(
              (f) => f.FIGHTER === row.original.FIGHTER
            );
            return (
              <tr
                {...row.getRowProps()}
                className={`table-row ${isSelected ? "selected-row" : ""}`}
                onClick={() => onRowClick(row.original)}
              >
                {view === "fighters" && (
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectFighter(row.original);
                      }}
                      disabled={!isSelected && selectedFighters.length >= 3}
                    />
                  </td>
                )}
                {row.cells.map((cell: Cell<FighterDetail>) => (
                  <td {...cell.getCellProps()} className="table-cell">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          <ChevronsLeft />
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          <ChevronLeft />
        </button>
        <span>
          Page <strong>{pageIndex + 1}</strong> of{" "}
          <strong>{pageOptions.length}</strong>
        </span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          <ChevronRight />
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          <ChevronsRight />
        </button>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// FightStatsModal Component
function FightStatsModal({
  fight,
  isOpen,
  onClose,
}: {
  fight: FighterDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  const allStats = useMemo(() => {
    if (!fight) return [];
    return Object.keys(fight).filter((key) => key !== "FIGHTER");
  }, [fight]);

  const selectAll = selectedStats.length === allStats.length && allStats.length > 0;

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedStats([]);
    } else {
      setSelectedStats(allStats);
    }
  };

  const handleStatChange = (stat: string) => {
    setSelectedStats((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  useEffect(() => {
    setSelectedStats([]);
  }, [fight]);

  if (!isOpen || !fight) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Fight Stats</h2>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-body">
          <div className="stats-selection">
            <h3>Select Stats to View:</h3>
            <label className="stat-checkbox">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              Select All
            </label>
            <div className="stats-checkboxes">
              {allStats.map((stat) => (
                <label key={stat} className="stat-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStats.includes(stat)}
                    onChange={() => handleStatChange(stat)}
                  />
                  {stat}
                </label>
              ))}
            </div>
          </div>
          <div className="comparison-table-container">
            {selectedStats.length > 0 ? (
              <table className="stats-table">
                <tbody>
                  {selectedStats.map((stat) => (
                    <tr key={stat}>
                      <td className="stats-key">{stat}</td>
                      <td className="stats-value">{fight[stat]}</td>
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
  );
}

// ComparisonModal Component
function ComparisonModal({
  fighters,
  onClose,
}: {
  fighters: FighterDetail[];
  onClose: () => void;
}) {
  const [selectedStats, setSelectedStats] = useState<string[]>([]);

  const allStats = useMemo(() => {
    if (fighters.length === 0) return [];
    return Object.keys(fighters[0]).filter(
      (key) => key !== "FIGHTER" && key !== "Division"
    );
  }, [fighters]);

  const selectAll = selectedStats.length === allStats.length && allStats.length > 0;

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedStats([]);
    } else {
      setSelectedStats(allStats);
    }
  };

  const handleStatChange = (stat: string) => {
    setSelectedStats((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  return (
    <div className="comparison-modal-overlay" onClick={onClose}>
      <div
        className="comparison-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Fighter Comparison</h2>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="comparison-modal-body">
          <div className="stats-selection">
            <h3>Select Stats to Compare:</h3>
            <label className="stat-checkbox">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              Select All
            </label>
            <div className="stats-checkboxes">
              {allStats.map((stat) => (
                <label key={stat} className="stat-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStats.includes(stat)}
                    onChange={() => handleStatChange(stat)}
                  />
                  {stat}
                </label>
              ))}
            </div>
          </div>
          <div className="comparison-table-container">
            {selectedStats.length > 0 ? (
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    {fighters.map((fighter) => (
                      <th key={fighter.FIGHTER}>{fighter.FIGHTER}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStats.map((stat) => (
                    <tr key={stat}>
                      <td className="stats-key">{stat}</td>
                      {fighters.map((fighter) => (
                        <td key={fighter.FIGHTER} className="stats-value">
                          {fighter[stat]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Please select at least one stat to compare.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function DataExplorerPage() {
  const [fighterDetails, setFighterDetails] = useState<FighterDetail[]>([]);
  const [fightStats, setFightStats] = useState<FighterDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"fighters" | "fights">("fighters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFight, setSelectedFight] = useState<FighterDetail | null>(
    null
  );
  const [selectedFighter, setSelectedFighter] = useState<FighterDetail | null>(
    null
  );
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedStance, setSelectedStance] = useState<string>("");

  const [selectedFightersForComparison, setSelectedFightersForComparison] =
    useState<FighterDetail[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showFightStatsModal, setShowFightStatsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fighterResponse, fightResponse] = await Promise.all([
          fetch("/data/fighter_total_stats.csv"),
          fetch("/data/fight_with_stats.csv"),
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
            setError("Error parsing fighter CSV: " + error.message);
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
            setError("Error parsing fight CSV: " + error.message);
          },
        });

        setLoading(false);
      } catch (error: any) {
        setError("Error fetching CSV data: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processFighterData = (data: FighterDetail[]) => {
    const numericFields = [
      "HEIGHT_fighter",
      "WEIGHT_fighter",
      "REACH_fighter",
      "Fights",
      "Win",
      "Loss",
      "Draw",
    ];

    return data.map((fighter) => {
      numericFields.forEach((field) => {
        if (
          fighter[field] !== undefined &&
          fighter[field] !== null &&
          fighter[field] !== ""
        ) {
          fighter[field] = parseFloat(fighter[field] as string);
        } else {
          fighter[field] = 0;
        }
      });

      const totalFights = (fighter["Fights"] as number) || 1;
      const wins = (fighter["Win"] as number) || 0;
      fighter["WinPercentage"] = ((wins / totalFights) * 100).toFixed(2);

      const weight = fighter["WEIGHT_fighter"] as number;
      fighter["Division"] = getDivision(weight);

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

  const columns: Column<FighterDetail>[] = useMemo(() => {
    if (view === "fighters") {
      return [
        {
          Header: "Fighter",
          accessor: "FIGHTER",
        },
        {
          Header: "Division",
          accessor: "Division",
        },
        {
          Header: "Stance",
          accessor: "STANCE_fighter",
        },
        {
          Header: "Height (in)",
          accessor: "HEIGHT_fighter",
        },
        {
          Header: "Weight (lbs)",
          accessor: "WEIGHT_fighter",
        },
        {
          Header: "Reach (in)",
          accessor: "REACH_fighter",
        },
        {
          Header: "Fights",
          accessor: "Fights",
        },
        {
          Header: "Wins",
          accessor: "Win",
        },
        {
          Header: "Losses",
          accessor: "Loss",
        },
        {
          Header: "Win Percentage",
          accessor: "WinPercentage",
          Cell: ({ value }: { value: number }) => `${value}%`,
        },
      ];
    } else {
      // Subset of fight data columns
      return [
        {
          Header: "Event",
          accessor: "EVENT",
        },
        {
          Header: "Bout",
          accessor: "BOUT",
        },
        {
          Header: "Date",
          accessor: "DATE_Event",
        },
        {
          Header: "Weight Class",
          accessor: "WeightClass",
        },
        {
          Header: "Fighter",
          accessor: "FIGHTER",
        },
        {
          Header: "Opponent",
          accessor: "OPPONENT",
        },
        {
          Header: "Method",
          accessor: "METHOD",
        },
        {
          Header: "Round",
          accessor: "ROUND",
        },
        {
          Header: "Time",
          accessor: "TIME",
        },
      ];
    }
  }, [view]);

  const data = useMemo(() => {
    let currentData = view === "fighters" ? fighterDetails : fightStats;

    if (searchQuery) {
      if (view === "fighters") {
        // Filter by fighter name
        currentData = currentData.filter((item) =>
          String(item.FIGHTER)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
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
    if (view === "fighters") {
      if (selectedDivision) {
        currentData = currentData.filter(
          (item) => item.Division === selectedDivision
        );
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  const handleRowClick = (data: FighterDetail) => {
    if (view === "fights") {
      setSelectedFight(data);
      setShowFightStatsModal(true);
    } else if (view === "fighters") {
      setSelectedFighter(data);
    }
  };

  return (
    <div className="container">
      <Link href="/" className="back-button">
        <ArrowLeftCircle className="icon" />
        Back to Dashboard
      </Link>
      <h1 className="header">UFC Data Explorer</h1>
      <div className="button-group">
        <CustomButton
          onClick={() => setView("fighters")}
          isActive={view === "fighters"}
        >
          Fighters
        </CustomButton>
        <CustomButton
          onClick={() => setView("fights")}
          isActive={view === "fights"}
        >
          Fight Stats
        </CustomButton>
      </div>

      <SearchBox onSearch={setSearchQuery} suggestionsData={fighterNames} />

      {view === "fighters" && (
        <>
          <div className="filters-container">
            <label className="filter-label">
              Division:
              <select
                className="filter-select"
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
            <label className="filter-label">
              Stance:
              <select
                className="filter-select"
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
          <div className="selected-fighters-container">
            <h3>Selected Fighters:</h3>
            <div className="selected-fighters">
              {selectedFightersForComparison.map((fighter) => (
                <div key={fighter.FIGHTER} className="selected-fighter">
                  <span>{fighter.FIGHTER}</span>
                  <button
                    className="remove-fighter-button"
                    onClick={() => handleRemoveFighter(fighter)}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
              {selectedFightersForComparison.length > 0 && (
                <button
                  className="clear-selection-button"
                  onClick={handleClearSelection}
                >
                  Clear All
                </button>
              )}
            </div>
            <CustomButton
              onClick={() => setShowComparisonModal(true)}
              disabled={selectedFightersForComparison.length < 2}
            >
              Compare
            </CustomButton>
          </div>
        </>
      )}

      <DataTable
        columns={columns}
        data={data}
        selectedFighters={selectedFightersForComparison}
        onSelectFighter={handleSelectFighter}
        onRowClick={handleRowClick}
        view={view}
      />

      {/* Fight Stats Modal */}
      <FightStatsModal
        fight={selectedFight}
        isOpen={showFightStatsModal}
        onClose={() => {
          setSelectedFight(null);
          setShowFightStatsModal(false);
        }}
      />

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          fighters={selectedFightersForComparison}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
}
