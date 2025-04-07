"use client";

import { useState, useRef, useEffect } from "react";
import { Roulette } from "../app/lib/roulette";
import { MartingaleStrategy } from "../app/lib/martingaleStrategy";
import "./globals.css";

export default function Home() {
  // Game settings
  const [initialBet, setInitialBet] = useState(10);
  const [maxLevels, setMaxLevels] = useState(5);
  const [profitGoal, setProfitGoal] = useState(100);
  const [showMessages, setShowMessages] = useState(true);

  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [wallet, setWallet] = useState(1000); // Starting with R1000
  const [sessionProfit, setSessionProfit] = useState(0);

  // Refs for auto-scrolling
  const historyEndRef = useRef(null);
  const resultsRef = useRef(null);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Auto-scroll to results when simulation ends
  useEffect(() => {
    if (results) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  const calculateCapital = (bet, levels) => {
    let capital = 0;
    for (let i = 0; i < levels; i++) {
      capital += bet * 2 ** i;
    }
    return capital;
  };

  const resetGame = () => {
    setIsRunning(false);
    setResults(null);
    setHistory([]);
    setCurrentStatus("Ready for new simulation");
    setSessionProfit(0);
  };

  const startSimulation = () => {
    if (isRunning) return;

    setIsRunning(true);
    setResults(null);
    setHistory([]);
    setCurrentStatus("Starting simulation...");

    const capital = calculateCapital(initialBet, maxLevels);
    const roulette = new Roulette();
    const strategy = new MartingaleStrategy({
      initial_bet: initialBet,
      max_levels: maxLevels,
      capital,
    });

    let iteration = 0;
    const newHistory = [];

    const runIteration = () => {
      if (
        strategy.statistics.capital_lost ||
        strategy.statistics.total_amount_won >= profitGoal
      ) {
        const finalStats = strategy.statistics.summary();
        setResults(finalStats);
        setIsRunning(false);

        // Update wallet and session profit
        const profit = finalStats.net_profit;
        setSessionProfit((prev) => prev + profit);
        setWallet((prev) => prev + profit);

        setCurrentStatus(
          strategy.statistics.capital_lost
            ? `Lost capital after ${iteration} iterations!`
            : `Completed ${iteration} iterations`
        );
        return;
      }

      iteration++;
      const betAmount = strategy.current_bet;
      const currentProfit = strategy.statistics.total_amount_won;

      setCurrentStatus(
        `Iteration #${iteration}: Betting R${betAmount}, Current Profit: R${currentProfit}`
      );

      if (showMessages) {
        newHistory.push({
          iteration,
          betAmount,
          currentProfit,
          type: "bet",
        });
      }

      setTimeout(() => {
        const win = roulette.spin();

        if (win) {
          strategy.handle_win();
          if (showMessages) {
            newHistory.push({
              iteration,
              result: "WIN",
              profit: strategy.statistics.total_amount_won,
            });
          }
        } else {
          strategy.handle_loss();
          if (showMessages) {
            newHistory.push({
              iteration,
              result: "LOSS",
              profit: strategy.statistics.total_amount_won,
            });
          }
        }

        setHistory([...newHistory]);
        runIteration();
      }, 300);
    };

    runIteration();
  };

  return (
    <div className="container">
      <h1>Martingale Strategy Simulator</h1>

      {/* Wallet and Session Tracking */}
      <div className="wallet-info">
        <div className="wallet-item">
          <h3>Current Wallet</h3>
          <p className={wallet >= 1000 ? "win" : "loss"}>R{wallet}</p>
        </div>
        <div className="wallet-item">
          <h3>Session Profit</h3>
          <p className={sessionProfit >= 0 ? "win" : "loss"}>
            R{sessionProfit}
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls">
        <div className="control-group">
          <label>Initial Bet</label>
          <input
            type="number"
            value={initialBet}
            onChange={(e) => setInitialBet(Number(e.target.value))}
            disabled={isRunning}
            min="1"
          />
        </div>

        <div className="control-group">
          <label>Max Levels</label>
          <input
            type="number"
            value={maxLevels}
            onChange={(e) => setMaxLevels(Number(e.target.value))}
            disabled={isRunning}
            min="1"
          />
        </div>

        <div className="control-group">
          <label>Profit Goal</label>
          <input
            type="number"
            value={profitGoal}
            onChange={(e) => setProfitGoal(Number(e.target.value))}
            disabled={isRunning}
            min="1"
          />
        </div>

        <div className="control-group checkbox-group">
          <label>
            Show Messages
            <input
              type="checkbox"
              checked={showMessages}
              onChange={(e) => setShowMessages(e.target.checked)}
              disabled={isRunning}
            />
          </label>
        </div>

        <div className="button-group">
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="start-button"
          >
            Start Simulation
          </button>
          <button onClick={resetGame} className="reset-button">
            Reset Session
          </button>
        </div>
      </div>

      <div className="status">{currentStatus}</div>

      {/* History Section with Auto-scroll */}
      {history.length > 0 && (
        <div className="history">
          <h3>Bet History</h3>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                {item.type === "bet" ? (
                  <p>
                    #{item.iteration}: Bet R{item.betAmount} (Profit: R
                    {item.currentProfit})
                  </p>
                ) : (
                  <p className={item.result === "WIN" ? "win" : "loss"}>
                    #{item.iteration}: {item.result}! New profit: R{item.profit}
                  </p>
                )}
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>
      )}

      {/* Results Section with Auto-scroll */}
      {results && (
        <div className="results" ref={resultsRef}>
          <h2>Simulation Results</h2>
          <div className="result-grid">
            <div>
              <h3>Summary</h3>
              <p>Total spins: {results.total_spins}</p>
              <p>
                Wins: {results.wins} ({results.win_percentage.toFixed(2)}%)
              </p>
              <p>
                Losses: {results.losses} ({results.loss_percentage.toFixed(2)}%)
              </p>
              <p>Win/Loss ratio: {results.win_loss_ratio.toFixed(2)}</p>
            </div>
            <div>
              <h3>Financials</h3>
              <p>Total amount won: R{results.total_amount_won}</p>
              <p>Initial capital: R{results.capital}</p>
              <p>Capital lost: {results.capital_lost ? "Yes" : "No"}</p>
              <p>Net profit: R{results.net_profit}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
