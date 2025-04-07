import { Statistics } from "./statistics";

export class MartingaleStrategy {
  constructor({ initial_bet, max_levels, capital }) {
    this.initial_bet = initial_bet;
    this.current_bet = initial_bet;
    this.max_levels = max_levels;
    this.consecutive_losses = 0;
    this.statistics = new Statistics(capital);
  }

  handle_win() {
    this.consecutive_losses = 0;
    this.current_bet = this.initial_bet;
    this.statistics.record_win(this.initial_bet);
  }

  handle_loss() {
    this.consecutive_losses += 1;

    if (this.consecutive_losses >= this.max_levels) {
      this.statistics.capital_lost = true;
    } else if (this.consecutive_losses < this.max_levels) {
      this.current_bet *= 2;
    }

    this.statistics.record_loss();
  }
}
