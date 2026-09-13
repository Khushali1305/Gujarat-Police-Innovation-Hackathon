import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RoleProvider } from "./context/RoleContext";
import "./styles/global.css";

// TODO(auth): wrap with <AuthProvider> (from context/AuthContext.tsx) as the
// outermost provider once real login exists - see that file's header comment.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RoleProvider>
      <App />
    </RoleProvider>
  </StrictMode>
);
