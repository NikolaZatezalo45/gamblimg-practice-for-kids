"use client";

import { useState, useRef } from "react";
import { Roulette } from "../app/lib/roulette";
import { MartingaleStrategy } from "../app/lib/martingaleStrategy";

export default function Home() {
  const [initialBet, setInitialBet] = useState(10);
  const [maxLevels, setMaxLevels] = useState(5);
  const [profitGoal, setProfitGoal] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [showMessages, setShowMessages] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("");
  const simulatorRef = useRef(null);

  const calculateCapital = (bet, levels) => {
    let capital = 0;
    for (let i = 0; i < levels; i++) {
      capital += bet * 2 ** i;
    }
    return capital;
  };

  const startSimulation = () => {
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
        finishSimulation(strategy, iteration);
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

  const finishSimulation = (strategy, iterations) => {
    setResults(strategy.statistics.summary());
    setIsRunning(false);
    setCurrentStatus(
      strategy.statistics.capital_lost
        ? `Lost capital after ${iterations} iterations!`
        : `Completed ${iterations} iterations`
    );
  };

  return (
    <div className="container">
      <h1>Martingale Strategy Simulator</h1>

      <div className="controls">
        <div className="control-group">
          <label>
            Initial Bet:
            <input
              type="number"
              value={initialBet}
              onChange={(e) => setInitialBet(Number(e.target.value))}
              disabled={isRunning}
              min="1"
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Max Levels:
            <input
              type="number"
              value={maxLevels}
              onChange={(e) => setMaxLevels(Number(e.target.value))}
              disabled={isRunning}
              min="1"
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Profit Goal:
            <input
              type="number"
              value={profitGoal}
              onChange={(e) => setProfitGoal(Number(e.target.value))}
              disabled={isRunning}
              min="1"
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Show Messages:
            <input
              type="checkbox"
              checked={showMessages}
              onChange={(e) => setShowMessages(e.target.checked)}
              disabled={isRunning}
            />
          </label>
        </div>

        <button onClick={startSimulation} disabled={isRunning}>
          Start Simulation
        </button>
      </div>

      <div className="status">{currentStatus}</div>

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
          </div>
        </div>
      )}

      {results && (
        <div className="results">
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
