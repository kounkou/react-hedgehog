/*
import React from "react";
import WelcomePage from "./components/WelcomePage";

const App: React.FC = () => {
  return <WelcomePage />;
};

export default App;
*/

/*
import React, { useState } from "react";

const App: React.FC = () => {
  const [number, setNumber] = useState<number>(15);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFizzBuzz = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/fizzbuzz?n=${number}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }
      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>FizzBuzz App</h1>
      <div>
        <label htmlFor="numberInput">Enter a number:</label>
        <input
          onChange={(e) => setNumber(Number(e.target.value))}
        />
        <button onClick={fetchFizzBuzz}>
          Generate
        </button>
      </div>
      {error && <p>Error: {error}</p>}
      {!error &&
        < div >
          <h2>Results:</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      }
    </div >
  );
};

export default App;
*/

import React, { useState } from "react";
import instructionsImage from './instructions.png';

const GRID_SIZE = 5;
const NUMBER_RANGE = 5;

type Cell = {
  value: number;
  isSelected: boolean;
  isHighlighted: boolean;
};

const generateGrid = (): Cell[][] => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => {
      let value;
      do {
        value = Math.ceil(Math.random() * NUMBER_RANGE);
      } while (value === 0);

      return {
        value,
        isSelected: false,
        isHighlighted: false,
      };
    })
  );
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>(generateGrid());
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (start && start[0] === row && start[1] === col) {
      // If the same cell is clicked, clear the selection
      setStart(null);
      setGrid((prevGrid) =>
        prevGrid.map((r) =>
          r.map((cell) => ({
            ...cell,
            isSelected: false, // Remove selection from all cells
          }))
        )
      );
    } else if (!start) {
      // Set the start cell and mark it as selected
      setStart([row, col]);
      setGrid((prevGrid) =>
        prevGrid.map((r, rIdx) =>
          r.map((cell, cIdx) => ({
            ...cell,
            isSelected: rIdx === row && cIdx === col,
          }))
        )
      );
    } else {
      // Set the end cell and highlight the selection
      setEnd([row, col]);
      highlightSelection(start, [row, col]);
    }
  };

  const highlightSelection = (start: [number, number], end: [number, number]) => {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    if (startRow !== endRow && startCol !== endCol && Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) {
      console.log("Selection must be in a row, column, or diagonal.");
      return;
    }

    const newGrid = [...grid];
    let sequence: number[] = [];
    let highlightCells: [number, number][] = [];

    if (startRow === endRow) {
      // Horizontal selection
      for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
        sequence.push(newGrid[startRow][col].value);
        highlightCells.push([startRow, col]);
      }
    } else if (startCol === endCol) {
      // Vertical selection
      for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
        sequence.push(newGrid[row][startCol].value);
        highlightCells.push([row, startCol]);
      }
    } else {
      // Diagonal selection
      const rowStep = startRow < endRow ? 1 : -1;
      const colStep = startCol < endCol ? 1 : -1;
      let row = startRow;
      let col = startCol;

      while (row !== endRow + rowStep && col !== endCol + colStep) {
        sequence.push(newGrid[row][col].value);
        highlightCells.push([row, col]);
        row += rowStep;
        col += colStep;
      }
    }

    // Ensure the sequence is at least 3 in size
    if (sequence.length < 3) {
      console.log("The sequence must be at least 3 numbers long.");
      return;
    }

    const isCorrect = evaluateSequence(sequence);

    if (isCorrect) {
      highlightCells.forEach(([row, col]) => {
        newGrid[row][col].isHighlighted = true;
      });
    }

    setGrid(newGrid);
    setStart(null);
    setEnd(null);
  };


  const evaluateSequence = (sequence: number[]) => {
    const sumOfRestExceptLast = sequence.slice(0, -1).reduce((acc, num) => acc + num, 0);
    const last = sequence[sequence.length - 1];

    const sumOfRestExceptFirst = sequence.slice(1).reduce((acc, num) => acc + num, 0);
    const first = sequence[0];

    if (sumOfRestExceptLast === last || sumOfRestExceptFirst === first) {
      const pointsScored = sumOfRestExceptLast === last ? sumOfRestExceptLast : sumOfRestExceptFirst;
      setScore((prevScore) => prevScore + pointsScored);
      console.log(`Correct! You scored ${pointsScored} points.`);
      return true;
    } else {
      console.log("Incorrect selection. Try again.");
      return false;
    }
  };

  const resetGrid = () => {
    setGrid(generateGrid());
    setStart(null);
    setEnd(null);
    setScore(0);
  };

  const showSolutions = () => {
    const newGrid = [...grid];
    let totalScore = 0;

    const evaluateAndHighlight = (sequence: number[], highlightCells: [number, number][]) => {
      const sumOfRestExceptLast = sequence.slice(0, -1).reduce((acc, num) => acc + num, 0);
      const last = sequence[sequence.length - 1];

      const sumOfRestExceptFirst = sequence.slice(1).reduce((acc, num) => acc + num, 0);
      const first = sequence[0];

      let pointsScored = 0;

      if (sequence.length >= 3 && (sumOfRestExceptLast === last || sumOfRestExceptFirst === first)) {
        pointsScored = sumOfRestExceptLast === last ? sumOfRestExceptLast : sumOfRestExceptFirst;
        highlightCells.forEach(([row, col]) => {
          newGrid[row][col].isHighlighted = true; // Mark as part of the solution
        });
      }
      return pointsScored;
    };


    // Check all horizontal sequences
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let colStart = 0; colStart < GRID_SIZE - 1; colStart++) {
        for (let colEnd = colStart + 1; colEnd < GRID_SIZE; colEnd++) {
          const sequence = [];
          const highlightCells: [number, number][] = [];
          for (let col = colStart; col <= colEnd; col++) {
            sequence.push(newGrid[row][col].value);
            highlightCells.push([row, col]);
          }

          if (sequence.length > 2) {  // Ensure at least 3 elements
            const pointsScored = evaluateAndHighlight(sequence, highlightCells);
            totalScore += pointsScored;
          }
        }
      }
    }

    // Check all vertical sequences
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let rowStart = 0; rowStart < GRID_SIZE - 1; rowStart++) {
        for (let rowEnd = rowStart + 1; rowEnd < GRID_SIZE; rowEnd++) {
          const sequence = [];
          const highlightCells: [number, number][] = [];
          for (let row = rowStart; row <= rowEnd; row++) {
            sequence.push(newGrid[row][col].value);
            highlightCells.push([row, col]);
          }

          if (sequence.length > 2) {  // Ensure at least 3 elements
            const pointsScored = evaluateAndHighlight(sequence, highlightCells);
            totalScore += pointsScored;
          }
        }
      }
    }

    // Check all diagonal sequences (top-left to bottom-right)
    for (let rowStart = 0; rowStart < GRID_SIZE - 1; rowStart++) {
      for (let colStart = 0; colStart < GRID_SIZE - 1; colStart++) {
        let row = rowStart;
        let col = colStart;
        const sequence = [];
        const highlightCells: [number, number][] = [];
        while (row < GRID_SIZE && col < GRID_SIZE) {
          sequence.push(newGrid[row][col].value);
          highlightCells.push([row, col]);
          row++;
          col++;
        }
        if (sequence.length > 2) {  // Ensure at least 3 elements
          const pointsScored = evaluateAndHighlight(sequence, highlightCells);
          totalScore += pointsScored;
        }
      }
    }

    // Check all diagonal sequences (top-right to bottom-left)
    for (let rowStart = 0; rowStart < GRID_SIZE - 1; rowStart++) {
      for (let colStart = GRID_SIZE - 1; colStart > 0; colStart--) {
        let row = rowStart;
        let col = colStart;
        const sequence = [];
        const highlightCells: [number, number][] = [];
        while (row < GRID_SIZE && col >= 0) {
          sequence.push(newGrid[row][col].value);
          highlightCells.push([row, col]);
          row++;
          col--;
        }
        if (sequence.length > 2) {  // Ensure at least 3 elements
          const pointsScored = evaluateAndHighlight(sequence, highlightCells);
          totalScore += pointsScored;
        }
      }
    }

    // Update grid and score after evaluating all solutions
    setGrid(newGrid);
    setScore(totalScore);
    console.log(`Displaying solutions. Total score: ${totalScore}`);
  };

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>La Grille</h1>
      <h2>Points: {score}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 50px)`,
          gap: "5px",
          justifyContent: "center",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: cell.isHighlighted
                  ? "lightgreen"
                  : cell.isSelected
                  ? "lightblue"
                  : "white",
                border: "1px solid black",
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              {cell.value}
            </div>
          ))
        )}
      </div>
      {/* Add margin between grid and buttons */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={resetGrid}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "150px",
          }}
        >
          Nouveau jeu
        </button>
        <button
          onClick={showSolutions}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "150px",
          }}
        >
          Solutions
        </button>
      </div>
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={togglePopup}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "310px",
          }}>
            Instructions
        </button>
        </div>
      {isPopupOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h2>Instructions</h2>
          <img
            src={instructionsImage}
            alt="Instructions Visual"
            style={{
              maxWidth: "100%",
              maxHeight: "80%",
              borderRadius: "10px",
            }}
          />
          <button
            onClick={togglePopup}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              background: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

