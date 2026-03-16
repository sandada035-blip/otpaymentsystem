"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage(){

 const router = useRouter()
 const [email,setEmail] = useState("")
 const [password,setPassword] = useState("")

 const login = ()=>{

  if(email==="admin@school.com" && password==="123456"){
    localStorage.setItem("role","admin")
    router.push("/dashboard")
    return
  }

  if(email==="user@school.com" && password==="123456"){
    localStorage.setItem("role","user")
    router.push("/dashboard")
    return
  }

  alert("Invalid login")

 }

 return(
  <div>
   <h1>Login System</h1>

   <input placeholder="Email"
    onChange={(e)=>setEmail(e.target.value)}
   />

   <br/><br/>

   <input type="password"
    placeholder="Password"
    onChange={(e)=>setPassword(e.target.value)}
   />

   <br/><br/>

   <button onClick={login}>Login</button>

  </div>
 )
}