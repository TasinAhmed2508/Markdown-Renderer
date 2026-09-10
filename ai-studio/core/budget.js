export class BudgetManager {
  constructor(limit = 10) { this.limit = Number(limit); this.reserved = 0; this.spent = 0; }
  available() { return Math.max(0, this.limit - this.reserved - this.spent); }
  reserve(amount) {
    amount = Math.max(0, Number(amount) || 0);
    if (amount > this.available()) return {ok:false, reason:'budget-exhausted'};
    this.reserved += amount; return {ok:true, amount};
  }
  reconcile(reserved, actual) {
    this.reserved = Math.max(0, this.reserved - Math.max(0, reserved || 0));
    this.spent += Math.max(0, actual || 0);
    return {spent:this.spent, remaining:this.available()};
  }
  snapshot() { return {limit:this.limit, reserved:this.reserved, spent:this.spent, available:this.available()}; }
}
