// ============================================================================
// LOGIN SCREEN — NOT WIRED UP YET
// ----------------------------------------------------------------------------
// Pairs with context/AuthContext.tsx. Left fully written but commented so it
// doesn't get accidentally imported/rendered before real auth exists. See
// the activation steps at the top of AuthContext.tsx — step 3 renders this
// component in App.tsx once `user` is null.
// ============================================================================

// import { useState, type FormEvent } from "react";
// import { useAuth } from "../../context/AuthContext";
//
// export default function LoginScreen() {
//   const { login, error } = useAuth();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       await login(username, password);
//     } catch {
//       // error message is already surfaced via useAuth().error
//     } finally {
//       setSubmitting(false);
//     }
//   }
//
//   return (
//     <div style={{
//       height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
//       background: "var(--bg)", color: "var(--text)",
//     }}>
//       <form onSubmit={handleSubmit} className="card" style={{ width: 340 }}>
//         <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Setu</div>
//         <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}>
//           Unified CCTV Intelligence — sign in
//         </div>
//         <label className="field-label">Username</label>
//         <input
//           className="input"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           style={{ marginBottom: 12 }}
//           autoFocus
//         />
//         <label className="field-label">Password</label>
//         <input
//           className="input"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={{ marginBottom: 16 }}
//         />
//         {error && (
//           <div style={{ color: "var(--crit)", fontSize: 12, marginBottom: 12 }}>{error}</div>
//         )}
//         <button className="btn primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
//           {submitting ? "Signing in…" : "Sign in"}
//         </button>
//       </form>
//     </div>
//   );
// }

export {};
