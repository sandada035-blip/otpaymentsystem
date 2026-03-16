"use client"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthGuard from "@/components/AuthGuard"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
const initialForm = { name: "", gender: "", grade: "", teacher: "" }

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")
  useEffect(() => { loadData() }, [])
  async function loadData() {
    const [{ data: studentsData }, { data: teachersData }] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("teachers").select("*").order("name", { ascending: true })
    ])
    if (studentsData) setStudents(studentsData)
    if (teachersData) setTeachers(teachersData)
  }
  function openAddForm() { setEditingId(null); setForm(initialForm); setShowForm(true) }
  function openEditForm(student) { setEditingId(student.id); setForm({ name: student.name || "", gender: student.gender || "", grade: student.grade || "", teacher: student.teacher || "" }); setShowForm(true) }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.gender || !form.grade || !form.teacher) return alert("សូមបំពេញព័ត៌មានឱ្យគ្រប់ជាមុនសិន")
    let error = null
    if (editingId) error = (await supabase.from("students").update(form).eq("id", editingId)).error
    else error = (await supabase.from("students").insert([form])).error
    if (error) return alert("បញ្ហា: " + error.message)
    setShowForm(false); setEditingId(null); setForm(initialForm); loadData()
  }
  async function handleDelete(id) {
    if (!confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return
    const { error } = await supabase.from("students").delete().eq("id", id)
    if (error) return alert("លុបមិនបាន: " + error.message)
    loadData()
  }
  const teacherOptions = useMemo(() => teachers.map(t => t.name).filter(Boolean), [teachers])
  const filteredStudents = useMemo(() => students.filter(student => {
    const q = search.toLowerCase().trim()
    const matchesSearch = !q || String(student.name || "").toLowerCase().includes(q) || String(student.teacher || "").toLowerCase().includes(q) || String(student.grade || "").toLowerCase().includes(q)
    const matchesTeacher = !teacherFilter || String(student.teacher || "") === teacherFilter
    return matchesSearch && matchesTeacher
  }), [students, search, teacherFilter])

  return <AuthGuard>{(currentUser) => (
    <AppShell currentUser={currentUser}>
      <PageHeader kicker="Data Center" title="តារាងទិន្នន័យសិស្ស" subtitle="Admin កែប្រែបាន / User មើលបានតែប៉ុណ្ណោះ"
        actions={<>{currentUser.role === "admin" ? <button className="btn btn-primary" onClick={openAddForm}>＋ បញ្ចូលទិន្នន័យ</button> : <button className="btn btn-disabled" disabled>View Only</button>}<a href="/dashboard" className="btn btn-outline">📊 Dashboard</a></>} />
      {currentUser.role !== "admin" ? <div className="notice">គណនី User មិនអាចបញ្ចូល កែ ឬ លុបទិន្នន័យបានទេ។</div> : null}
      {showForm && currentUser.role === "admin" && <section className="surface-card form-card"><form onSubmit={handleSave}><div className="form-grid"><input name="name" placeholder="ឈ្មោះសិស្ស" value={form.name} onChange={handleChange} /><select name="gender" value={form.gender} onChange={handleChange}><option value="">ជ្រើសភេទ</option><option value="Male">ប្រុស</option><option value="Female">ស្រី</option></select><input name="grade" placeholder="ថ្នាក់" value={form.grade} onChange={handleChange} /><select name="teacher" value={form.teacher} onChange={handleChange}><option value="">ជ្រើសគ្រូ</option>{teacherOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div><div className="form-actions"><button type="submit" className="btn btn-primary">{editingId ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកទិន្នន័យ"}</button><button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(initialForm) }}>បោះបង់</button></div></form></section>}
      <section className="surface-card"><div className="surface-head"><div><div className="surface-title">លទ្ធផលទិន្នន័យ</div><div className="surface-desc">ស្វែងរក ឬ filter តាមគ្រូ</div></div><div className="filters"><div className="field"><select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}><option value="">-- គ្រប់គ្រូទាំងអស់ --</option>{teacherOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div><div className="field"><input placeholder="ស្វែងរកឈ្មោះសិស្ស ឬ គ្រូ..." value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
      <div className="table-wrap"><table className="pro-table"><thead><tr><th>ឈ្មោះសិស្ស</th><th>ភេទ</th><th>ថ្នាក់</th><th>គ្រូបង្រៀន</th><th>សកម្មភាព</th></tr></thead><tbody>{filteredStudents.length ? filteredStudents.map(student => <tr key={student.id}><td style={{fontWeight:700}}>{student.name}</td><td><span className="badge badge-gender">{student.gender}</span></td><td>{student.grade}</td><td><span className="badge badge-teacher">{student.teacher}</span></td><td>{currentUser.role === "admin" ? <div className="actions-row"><button className="icon-btn blue" onClick={() => openEditForm(student)}>✏️</button><button className="icon-btn red" onClick={() => handleDelete(student.id)}>🗑️</button></div> : <span className="badge badge-view">View Only</span>}</td></tr>) : <tr><td colSpan="5" className="empty">មិនមានទិន្នន័យ</td></tr>}</tbody></table></div></section>
    </AppShell>
  )}</AuthGuard>
}
