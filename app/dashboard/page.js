"use client"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthGuard from "@/components/AuthGuard"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
import { StatCard } from "@/components/StatsCards"

export default function DashboardPage() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [payments, setPayments] = useState([])
  useEffect(() => { loadData() }, [])
  async function loadData() {
    const [{ data: s }, { data: t }, { data: p }] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("teachers").select("*"),
      supabase.from("payments").select("*")
    ])
    if (s) setStudents(s)
    if (t) setTeachers(t)
    if (p) setPayments(p)
  }
  const stats = useMemo(() => {
    const totalStudents = students.length
    const femaleStudents = students.filter(s => String(s.gender).toLowerCase() === "female").length
    const maleStudents = students.filter(s => String(s.gender).toLowerCase() === "male").length
    const totalTeachers = teachers.length
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0)
    const teacherAmount = payments.reduce((sum, p) => sum + Number(p.teacher_share || 0), 0)
    const schoolAmount = payments.reduce((sum, p) => sum + Number(p.school_share || 0), 0)
    return { totalStudents, femaleStudents, maleStudents, totalTeachers, totalAmount, teacherAmount, schoolAmount }
  }, [students, teachers, payments])

  return (
    <AuthGuard>
      {(currentUser) => (
        <AppShell currentUser={currentUser}>
          <PageHeader kicker="Student Management" title="ប្រព័ន្ធគ្រប់គ្រងសាលា System Pro" subtitle="Admin អាចកែ លុប បញ្ចូលបាន។ User អាចមើលបានតែប៉ុណ្ណោះ។"
            actions={<><a href="/students" className="btn btn-outline">👨‍🎓 Students</a><a href="/teachers" className="btn btn-soft">👩‍🏫 Teachers</a><a href="/payments" className="btn btn-soft">💳 Payments</a></>} />
          <section className="hero-card">
            <div><div className="hero-badge">🛡️ Professional School Management</div><h2 className="hero-title">Dashboard សាលា ទំនើប និងគ្រប់គ្រងសិទ្ធិប្រើប្រាស់</h2><p className="hero-text">ប្រើបានជាមួយ Admin និង User ដោយសិទ្ធិខុសគ្នា។</p></div>
            <div className="role-box"><small>Role</small><strong>{currentUser.role === "admin" ? "Admin" : "User"}</strong></div>
          </section>
          <section className="stats-grid">
            <StatCard className="stat-blue" title="គ្រូសរុប" value={stats.totalTeachers} />
            <StatCard className="stat-purple" title="សិស្សស្រី" value={stats.femaleStudents} />
            <StatCard className="stat-green" title="សិស្សសរុប" value={stats.totalStudents} />
            <StatCard className="stat-orange" title="សិស្សប្រុស" value={stats.maleStudents} />
          </section>
          <section className="stats-grid large">
            <StatCard className="stat-dark" title="ទឹកប្រាក់សរុប" value={stats.totalAmount.toLocaleString("en-US") + " ៛"} />
            <StatCard className="stat-violet" title="ចំណែកគ្រូ (80%)" value={stats.teacherAmount.toLocaleString("en-US") + " ៛"} />
            <StatCard className="stat-teal" title="ចំណែកសាលា (20%)" value={stats.schoolAmount.toLocaleString("en-US") + " ៛"} />
          </section>
        </AppShell>
      )}
    </AuthGuard>
  )
}
