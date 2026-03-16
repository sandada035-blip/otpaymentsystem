export const metadata = {
  title: "School System Pro"
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{fontFamily:"Arial", padding:"20px"}}>
        {children}
      </body>
    </html>
  )
}