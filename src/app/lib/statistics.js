export class Statistics {
  constructor(capital) {
    this.wins = 0;
    this.losses = 0;
    this.total_amount_won = 0;
    this.capital_lost = false;
    this.capital = capital;
  }

  record_win(initial_bet) {
    this.wins += 1;
    this.total_amount_won += initial_bet;
  }

  record_loss() {
    this.losses += 1;
  }

  get total_spins() {
    return this.wins + this.losses;
  }

  get win_percentage() {
    return this.total_spins === 0 ? 0 : (this.wins / this.total_spins) * 100;
  }

  get loss_percentage() {
    return this.total_spins === 0 ? 0 : (this.losses / this.total_spins) * 100;
  }

  get win_loss_ratio() {
    return this.losses === 0 ? 0 : this.wins / this.losses;
  }

  get net_profit() {
    return this.capital_lost
      ? this.total_amount_won - this.capital
      : this.total_amount_won;
  }

  summary() {
    return {
      capital: this.capital,
      capital_lost: this.capital_lost,
      loss_percentage: this.loss_percentage,
      losses: this.losses,
      net_profit: this.net_profit,
      total_amount_won: this.total_amount_won,
      total_spins: this.total_spins,
      win_loss_ratio: this.win_loss_ratio,
      win_percentage: this.win_percentage,
      wins: this.wins,
    };
  }
}
