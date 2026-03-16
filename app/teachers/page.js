"use client"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthGuard from "@/components/AuthGuard"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
const initialForm = { name: "", gender: "", class_name: "", phone: "" }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  useEffect(() => { loadTeachers() }, [])
  async function loadTeachers() {
    const { data } = await supabase.from("teachers").select("*").order("created_at", { ascending: false })
    if (data) setTeachers(data)
  }
  function openAddForm() { setEditingId(null); setForm(initialForm); setShowForm(true) }
  function openEditForm(teacher) { setEditingId(teacher.id); setForm({ name: teacher.name || "", gender: teacher.gender || "", class_name: teacher.class_name || "", phone: teacher.phone || "" }); setShowForm(true) }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.gender || !form.class_name) return alert("សូមបំពេញព័ត៌មានគ្រូឱ្យគ្រប់ជាមុនសិន")
    let error = null
    if (editingId) error = (await supabase.from("teachers").update(form).eq("id", editingId)).error
    else error = (await supabase.from("teachers").insert([form])).error
    if (error) return alert("បញ្ហា: " + error.message)
    setShowForm(false); setEditingId(null); setForm(initialForm); loadTeachers()
  }
  async function handleDelete(id) {
    if (!confirm("តើអ្នកពិតជាចង់លុបគ្រូនេះមែនទេ?")) return
    const { error } = await supabase.from("teachers").delete().eq("id", id)
    if (error) return alert("លុបមិនបាន: " + error.message)
    loadTeachers()
  }
  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return teachers
    return teachers.filter(t => String(t.name || "").toLowerCase().includes(q) || String(t.class_name || "").toLowerCase().includes(q) || String(t.phone || "").toLowerCase().includes(q))
  }, [teachers, search])

  return <AuthGuard>{(currentUser) => (
    <AppShell currentUser={currentUser}>
      <PageHeader kicker="Teacher Management" title="តារាងគ្រូបង្រៀន" subtitle="Admin កែប្រែបាន / User មើលបានតែប៉ុណ្ណោះ"
        actions={<>{currentUser.role === "admin" ? <button className="btn btn-primary" onClick={openAddForm}>＋ បញ្ចូលគ្រូ</button> : <button className="btn btn-disabled" disabled>View Only</button>}<a href="/students" className="btn btn-outline">👨‍🎓 Students</a></>} />
      {currentUser.role !== "admin" ? <div className="notice">គណនី User មិនអាចបញ្ចូល កែ ឬ លុបទិន្នន័យបានទេ។</div> : null}
      {showForm && currentUser.role === "admin" && <section className="surface-card form-card"><form onSubmit={handleSave}><div className="form-grid"><input name="name" placeholder="ឈ្មោះគ្រូ" value={form.name} onChange={handleChange} /><select name="gender" value={form.gender} onChange={handleChange}><option value="">ជ្រើសភេទ</option><option value="Male">ប្រុស</option><option value="Female">ស្រី</option></select><input name="class_name" placeholder="ថ្នាក់/មុខវិជ្ជា" value={form.class_name} onChange={handleChange} /><input name="phone" placeholder="លេខទូរស័ព្ទ" value={form.phone} onChange={handleChange} /></div><div className="form-actions"><button type="submit" className="btn btn-primary">{editingId ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកព័ត៌មានគ្រូ"}</button><button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(initialForm) }}>បោះបង់</button></div></form></section>}
      <section className="surface-card"><div className="surface-head"><div><div className="surface-title">បញ្ជីគ្រូបង្រៀន</div><div className="surface-desc">ស្វែងរក និងគ្រប់គ្រងគ្រូ</div></div><div className="filters"><div className="field"><input placeholder="ស្វែងរកឈ្មោះគ្រូ ឬ ថ្នាក់..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
      <div className="table-wrap"><table className="pro-table"><thead><tr><th>ឈ្មោះគ្រូ</th><th>ភេទ</th><th>ថ្នាក់/មុខវិជ្ជា</th><th>លេខទូរស័ព្ទ</th><th>សកម្មភាព</th></tr></thead><tbody>{filteredTeachers.length ? filteredTeachers.map(teacher => <tr key={teacher.id}><td style={{fontWeight:700}}>{teacher.name}</td><td><span className="badge badge-gender">{teacher.gender || "-"}</span></td><td><span className="badge badge-class">{teacher.class_name || "-"}</span></td><td>{teacher.phone || "-"}</td><td>{currentUser.role === "admin" ? <div className="actions-row"><button className="icon-btn blue" onClick={() => openEditForm(teacher)}>✏️</button><button className="icon-btn red" onClick={() => handleDelete(teacher.id)}>🗑️</button></div> : <span className="badge badge-view">View Only</span>}</td></tr>) : <tr><td colSpan="5" className="empty">មិនមានទិន្នន័យគ្រូ</td></tr>}</tbody></table></div></section>
    </AppShell>
  )}</AuthGuard>
}
