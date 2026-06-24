import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const quotes = [
  "The side quest is usually the best part.",
  "Touch grass. Your couch will survive.",
  "Every boring day is one bad decision away from becoming a story.",
  "Adventure doesn’t need mountains. It needs motion.",
  "Nobody remembers the day they stayed home.",
];

const quote = quotes[Math.floor(Math.random() * quotes.length)];

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Logged in.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandBadge}>🧭</div>

<h1 style={styles.logo}>QUEST</h1>

<p style={styles.tagline}>
  Adventure Anywhere.
  <br />
  Memories Everywhere.
</p>

<div style={styles.quoteBox}>
  <strong>FIELD NOTE</strong>
  <p>{quote}</p>
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

       <input
  type={showPassword ? "text" : "password"}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
<label
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    fontSize: "14px",
  }}
>
  <input
    type="checkbox"
    checked={showPassword}
    onChange={() => setShowPassword(!showPassword)}
  />
  Show Password
</label>
        <button style={styles.button} onClick={signIn}>
          Log In
        </button>

        <button style={styles.secondaryButton} onClick={signUp}>
          Create Account
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5ecd9",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff8e9",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(0,0,0,.12)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid #d6c7a7",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#13291f",
    color: "#fff",
    fontWeight: 900,
    marginBottom: "10px",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #13291f",
    background: "transparent",
    color: "#13291f",
    fontWeight: 900,
    cursor: "pointer",
  },
};
