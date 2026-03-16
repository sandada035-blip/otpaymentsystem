export default function PageHeader({ kicker, title, subtitle, actions }) {
  return (
    <div className="page-top">
      <div className="page-heading">
        <img src="/logo.png" alt="Logo" className="page-logo" />
        <div>
          <div className="page-kicker">{kicker}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  )
}
