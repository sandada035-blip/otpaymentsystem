"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function NavItem({ href, icon, label }) {
  const pathname = usePathname()
  return (
    <Link href={href} className={`nav-item ${pathname === href ? "active" : ""}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <div>
            <div className="brand-title">System Pro</div>
            <div className="brand-subtitle">School Dashboard</div>
          </div>
        </div>

        <div className="nav-label">មុខងារ</div>
        <nav className="nav-list">
          <NavItem href="/dashboard" icon="📊" label="Dashboard" />
          <NavItem href="/students" icon="👨‍🎓" label="Students" />
          <NavItem href="/teachers" icon="👩‍🏫" label="Teachers" />
          <NavItem href="/payments" icon="💳" label="Payments" />
          <NavItem href="/reports" icon="🧾" label="Reports" />
          <NavItem href="/" icon="↩" label="Home" />
        </nav>

        <div className="sidebar-note">
          <small>ប្រព័ន្ធសាលារៀន</small>
          <div style={{fontSize:18,fontWeight:700,lineHeight:1.5}}>
            Smart • Clean •<br/>Professional
          </div>
        </div>
      </aside>
      <div className="main-content">{children}</div>
    </div>
  )
}
