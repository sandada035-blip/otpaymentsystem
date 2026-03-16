"use client"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthGuard from "@/components/AuthGuard"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function ReportsPage() {
  const [payments, setPayments] = useState([])
  const [teacherFilter, setTeacherFilter] = useState("")
  useEffect(() => { loadPayments() }, [])
  async function loadPayments() {
    const { data } = await supabase.from("payments").select("*").order("payment_date", { ascending: false })
    if (data) setPayments(data)
  }
  const filteredPayments = useMemo(() => !teacherFilter ? payments : payments.filter(p => String(p.teacher_name || "") === teacherFilter), [payments, teacherFilter])
  const totals = useMemo(() => filteredPayments.reduce((acc, p) => { acc.total += Number(p.total_amount || 0); acc.teacher += Number(p.teacher_share || 0); acc.school += Number(p.school_share || 0); return acc }, { total: 0, teacher: 0, school: 0 }), [filteredPayments])
  const teacherOptions = useMemo(() => Array.from(new Set(payments.map(p => p.teacher_name).filter(Boolean))).sort(), [payments])
  function printReport() {
    const rows = filteredPayments.map((p, i) => `<tr><td>${i + 1}</td><td>${p.student_name || "-"}</td><td>${p.teacher_name || "-"}</td><td>${Number(p.total_amount || 0).toLocaleString("en-US")} ៛</td><td>${Number(p.teacher_share || 0).toLocaleString("en-US")} ៛</td><td>${Number(p.school_share || 0).toLocaleString("en-US")} ៛</td><td>${p.payment_date || "-"}</td></tr>`).join("")
    const html = `<html><head><meta charset="UTF-8" /><title>Report</title><style>body{font-family:Arial,sans-serif;padding:24px}h2,h3{text-align:center}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:8px;text-align:left}th{background:#f2f2f2}.summary{margin-top:16px;width:320px;margin-left:auto}.sign{display:flex;justify-content:space-between;margin-top:50px}.sign div{width:38%;text-align:center;line-height:2}</style></head><body><h3>ព្រះរាជាណាចក្រកម្ពុជា</h3><h3>ជាតិ សាសនា ព្រះមហាក្សត្រ</h3><div>សាលាបឋមសិក្សាសម្តេចព្រះរាជអគ្គមហេសី</div><div>នរោត្តមមុនីនាថសីហនុ</div><h2>របាយការណ៍ការបង់ប្រាក់សិក្សា</h2><table><thead><tr><th>ល.រ</th><th>សិស្ស</th><th>គ្រូ</th><th>100%</th><th>80%</th><th>20%</th><th>ថ្ងៃបង់</th></tr></thead><tbody>${rows}</tbody></table><table class="summary"><tr><th>សរុប 100%</th><td>${totals.total.toLocaleString("en-US")} ៛</td></tr><tr><th>សរុប 80%</th><td>${totals.teacher.toLocaleString("en-US")} ៛</td></tr><tr><th>សរុប 20%</th><td>${totals.school.toLocaleString("en-US")} ៛</td></tr></table><div class="sign"><div>បានឃើញ និងឯកភាព<br/>នាយកសាលា</div><div>កាលបរិច្ឆេទ ............<br/>អ្នកធ្វើតារាង</div></div></body></html>`
    const w = window.open("", "_blank"); w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.print() }, 500)
  }
  return <AuthGuard>{(currentUser) => (
    <AppShell currentUser={currentUser}>
      <PageHeader kicker="Reports" title="របាយការណ៍" subtitle="Admin និង User អាចមើល និងព្រីនរបាយការណ៍បាន"
        actions={<><button className="btn btn-primary" onClick={printReport}>🖨️ Print Report</button><a href="/payments" className="btn btn-outline">💳 Payments</a></>} />
      <section className="surface-card"><div className="surface-head"><div><div className="surface-title">Report Center</div><div className="surface-desc">ជ្រើសគ្រូ រួចបោះពុម្ពរបាយការណ៍</div></div><div className="filters"><div className="field"><select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}><option value="">-- គ្រប់គ្រូទាំងអស់ --</option>{teacherOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div></div></div><div className="kpi-mini"><div className="kpi-box"><span>សរុប 100%</span><strong>{totals.total.toLocaleString("en-US")} ៛</strong></div><div className="kpi-box"><span>សរុប 80%</span><strong>{totals.teacher.toLocaleString("en-US")} ៛</strong></div><div className="kpi-box"><span>សរុប 20%</span><strong>{totals.school.toLocaleString("en-US")} ៛</strong></div></div></section>
    </AppShell>
  )}</AuthGuard>
}
