"use client"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthGuard from "@/components/AuthGuard"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
const initialForm = { student_id: "", teacher_name: "", total_amount: "", payment_date: "" }

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")
  useEffect(() => { loadData() }, [])
  async function loadData() {
    const [{ data: paymentsData }, { data: studentsData }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("name", { ascending: true })
    ])
    if (paymentsData) setPayments(paymentsData)
    if (studentsData) setStudents(studentsData)
  }
  function openAddForm() { setEditingId(null); setForm(initialForm); setShowForm(true) }
  function openEditForm(payment) { setEditingId(payment.id); setForm({ student_id: payment.student_id || "", teacher_name: payment.teacher_name || "", total_amount: payment.total_amount || "", payment_date: payment.payment_date || "" }); setShowForm(true) }
  function handleChange(e) {
    const { name, value } = e.target
    let nextForm = { ...form, [name]: value }
    if (name === "student_id") {
      const student = students.find(s => String(s.id) === String(value))
      if (student) nextForm.teacher_name = student.teacher || ""
    }
    setForm(nextForm)
  }
  async function handleSave(e) {
    e.preventDefault()
    if (!form.student_id || !form.total_amount || !form.payment_date) return alert("សូមបំពេញព័ត៌មានការបង់ប្រាក់ឱ្យគ្រប់ជាមុនសិន")
    const total = Number(form.total_amount || 0)
    const student = students.find(s => String(s.id) === String(form.student_id))
    const payload = { student_id: form.student_id, student_name: student?.name || "", teacher_name: form.teacher_name || student?.teacher || "", total_amount: total, teacher_share: total * 0.8, school_share: total * 0.2, payment_date: form.payment_date }
    let error = null
    if (editingId) error = (await supabase.from("payments").update(payload).eq("id", editingId)).error
    else error = (await supabase.from("payments").insert([payload])).error
    if (error) return alert("បញ្ហា: " + error.message)
    setShowForm(false); setEditingId(null); setForm(initialForm); loadData()
  }
  async function handleDelete(id) {
    if (!confirm("តើអ្នកពិតជាចង់លុបការបង់ប្រាក់នេះមែនទេ?")) return
    const { error } = await supabase.from("payments").delete().eq("id", id)
    if (error) return alert("លុបមិនបាន: " + error.message)
    loadData()
  }
  function printReceipt(payment) {
    const html = `<html><head><meta charset="UTF-8" /><title>Receipt</title><style>body{font-family:Arial,sans-serif;padding:24px}.box{max-width:560px;margin:0 auto;border:1px solid #ccc;border-radius:16px;padding:24px}h2{text-align:center;margin:0 0 16px}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px dashed #ddd}.right{text-align:right}</style></head><body><div class="box"><h2>Payment Receipt</h2><table><tr><td>Student</td><td class="right">${payment.student_name || "-"}</td></tr><tr><td>Teacher</td><td class="right">${payment.teacher_name || "-"}</td></tr><tr><td>Total</td><td class="right">${Number(payment.total_amount || 0).toLocaleString("en-US")} ៛</td></tr><tr><td>Teacher Share</td><td class="right">${Number(payment.teacher_share || 0).toLocaleString("en-US")} ៛</td></tr><tr><td>School Share</td><td class="right">${Number(payment.school_share || 0).toLocaleString("en-US")} ៛</td></tr><tr><td>Date</td><td class="right">${payment.payment_date || "-"}</td></tr></table></div></body></html>`
    const w = window.open("", "_blank"); w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.print() }, 500)
  }
  const filteredPayments = useMemo(() => payments.filter(payment => {
    const q = search.toLowerCase().trim()
    const matchesSearch = !q || String(payment.student_name || "").toLowerCase().includes(q) || String(payment.teacher_name || "").toLowerCase().includes(q)
    const matchesTeacher = !teacherFilter || String(payment.teacher_name || "") === teacherFilter
    return matchesSearch && matchesTeacher
  }), [payments, search, teacherFilter])
  const teacherOptions = useMemo(() => Array.from(new Set(payments.map(p => p.teacher_name).filter(Boolean))).sort(), [payments])

  return <AuthGuard>{(currentUser) => (
    <AppShell currentUser={currentUser}>
      <PageHeader kicker="Payment Management" title="ការបង់ប្រាក់សិក្សា" subtitle="Admin កែប្រែបាន / User មើល និង print បាន"
        actions={<>{currentUser.role === "admin" ? <button className="btn btn-primary" onClick={openAddForm}>＋ បញ្ចូលការបង់ប្រាក់</button> : <button className="btn btn-disabled" disabled>View Only</button>}<a href="/reports" className="btn btn-outline">🧾 Reports</a></>} />
      {currentUser.role !== "admin" ? <div className="notice">គណនី User មិនអាចបញ្ចូល កែ ឬ លុបទិន្នន័យបានទេ។ អាចមើល និង print receipt បានតែប៉ុណ្ណោះ។</div> : null}
      {showForm && currentUser.role === "admin" && <section className="surface-card form-card"><form onSubmit={handleSave}><div className="form-grid"><select name="student_id" value={form.student_id} onChange={handleChange}><option value="">ជ្រើសសិស្ស</option>{students.map(student => <option key={student.id} value={student.id}>{student.name} - {student.teacher}</option>)}</select><input name="teacher_name" placeholder="ឈ្មោះគ្រូ" value={form.teacher_name} onChange={handleChange} /><input name="total_amount" type="number" placeholder="ទឹកប្រាក់សរុប" value={form.total_amount} onChange={handleChange} /><input name="payment_date" type="date" value={form.payment_date} onChange={handleChange} /></div><div className="form-actions"><button type="submit" className="btn btn-primary">{editingId ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកការបង់ប្រាក់"}</button><button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(initialForm) }}>បោះបង់</button></div></form></section>}
      <section className="surface-card"><div className="surface-head"><div><div className="surface-title">បញ្ជីការបង់ប្រាក់</div><div className="surface-desc">ស្វែងរក កែ លុប និងបោះពុម្ពវិក័យប័ត្រ</div></div><div className="filters"><div className="field"><select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}><option value="">-- គ្រប់គ្រូទាំងអស់ --</option>{teacherOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div><div className="field"><input placeholder="ស្វែងរកសិស្ស ឬ គ្រូ..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
      <div className="table-wrap"><table className="pro-table"><thead><tr><th>សិស្ស</th><th>គ្រូ</th><th>100%</th><th>80%</th><th>20%</th><th>ថ្ងៃបង់ប្រាក់</th><th>សកម្មភាព</th></tr></thead><tbody>{filteredPayments.length ? filteredPayments.map(payment => <tr key={payment.id}><td style={{fontWeight:700}}>{payment.student_name}</td><td><span className="badge badge-teacher">{payment.teacher_name}</span></td><td>{Number(payment.total_amount || 0).toLocaleString("en-US")} ៛</td><td>{Number(payment.teacher_share || 0).toLocaleString("en-US")} ៛</td><td>{Number(payment.school_share || 0).toLocaleString("en-US")} ៛</td><td>{payment.payment_date}</td><td>{currentUser.role === "admin" ? <div className="actions-row"><button className="icon-btn blue" onClick={() => openEditForm(payment)}>✏️</button><button className="icon-btn" onClick={() => printReceipt(payment)}>🧾</button><button className="icon-btn red" onClick={() => handleDelete(payment.id)}>🗑️</button></div> : <div className="actions-row"><button className="icon-btn" onClick={() => printReceipt(payment)}>🧾</button><span className="badge badge-view">View Only</span></div>}</td></tr>) : <tr><td colSpan="7" className="empty">មិនមានទិន្នន័យការបង់ប្រាក់</td></tr>}</tbody></table></div></section>
    </AppShell>
  )}</AuthGuard>
}
