const STRATEGY = {
  Fast: m => m.latency,
  'Best quality': m => -m.quality,
  'Lowest cost': m => m.cost,
  Balanced: m => (m.cost * 0.35) + (m.latency * 0.002) - (m.quality * 0.5),
  Automatic: m => (m.cost * 0.25) + (m.latency * 0.0015) - (m.quality * 0.7)
};

export class ModelGateway {
  constructor(models = []) { this.models = models; }
  eligible(req = {}) {
    return this.models.filter(m => m.enabled !== false)
      .filter(m => !req.toolUse || m.tools)
      .filter(m => !req.private || m.privateAllowed)
      .filter(m => (m.context || 0) >= (req.tokens || 0))
      .filter(m => (m.quota ?? Infinity) > 0);
  }
  route(req = {}, strategy = 'Automatic') {
    const candidates = this.eligible(req);
    if (!candidates.length) return {ok:false, reason:'no-eligible-model'};
    const score = STRATEGY[strategy] || STRATEGY.Automatic;
    return {ok:true, model:[...candidates].sort((a,b) => score(a)-score(b))[0]};
  }
}
