const NEXT = {
  DRAFT:['PROPOSED'], PROPOSED:['VALIDATED','DRAFT'], VALIDATED:['ACCEPTED','PROPOSED'],
  ACCEPTED:['SUPERSEDED','DEPRECATED'], SUPERSEDED:[], DEPRECATED:[]
};

export class ContractRegistry {
  constructor() { this.items = new Map(); }
  create(contract) {
    const item = {...contract, state:'DRAFT', version:contract.version || '0.1.0'};
    this.items.set(item.id, item); return item;
  }
  transition(id, state) {
    const item = this.items.get(id);
    if (!item) return {ok:false, reason:'missing-contract'};
    if (!(NEXT[item.state] || []).includes(state)) return {ok:false, reason:'invalid-transition'};
    const next = {...item, state}; this.items.set(id, next); return {ok:true, contract:next};
  }
  list() { return [...this.items.values()]; }
}
