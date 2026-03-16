"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard(){

 const router = useRouter()

 useEffect(()=>{

  const role = localStorage.getItem("role")

  if(!role){
    router.push("/login")
  }

 },[])

 const role = typeof window !== "undefined" ? localStorage.getItem("role") : ""

 return(
  <div>

   <h1>Dashboard</h1>

   <p>Role: {role}</p>

   <ul>
     <li>Students</li>
     <li>Teachers</li>
     <li>Payments</li>
     <li>Reports</li>
   </ul>

  </div>
 )
}