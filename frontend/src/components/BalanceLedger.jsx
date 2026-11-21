// One row per leave type. Every box is a day: filled = taken, striped = awaiting approval, empty = still available.
export default function BalanceLedger({ balance }) {
  return (
    <section aria-label="Leave balance">
      <h2>Your balance this year</h2>
      <div className="ledger">
        {balance.map((b) => (
          <div className="ledger-row" key={b.id}>
            <div className="ledger-head">
              <strong>{b.name}</strong>
              <span className="muted">{b.remaining} of {b.total} days free</span>
            </div>
            <div className="boxes" role="img"
                 aria-label={`${b.used} taken, ${b.pending} pending, ${b.remaining} available`}>
              {Array.from({ length: b.total }).map((_, i) => {
                const cls = i < b.used ? "box used" : i < b.used + b.pending ? "box pending" : "box";
                return <span key={i} className={cls} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="legend">
        <span className="box used" /> taken <span className="box pending" /> waiting for approval <span className="box" /> available
      </p>
    </section>
  );
}
