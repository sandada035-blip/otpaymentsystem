export function StatCard({ className, title, value, sub }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  )
}
