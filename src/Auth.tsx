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

       <div style={styles.passwordWrap}>
  <input
    style={styles.passwordInput}
    placeholder="Password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    style={styles.eyeButton}
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>
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
  background: `
    radial-gradient(circle at top right, rgba(217,164,65,.25), transparent 25%),
    radial-gradient(circle at bottom left, rgba(19,41,31,.15), transparent 35%),
    #f5ecd9
  `,
  padding: "20px",
},
 card: {
  width: "100%",
  maxWidth: "460px",
  background: "rgba(255,248,233,.95)",
  borderRadius: "28px",
  padding: "32px",
  boxShadow: "0 20px 50px rgba(0,0,0,.15)",
  textAlign: "center",
  border: "1px solid rgba(19,41,31,.1)",
  backdropFilter: "blur(12px)",
},
      brandBadge: {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "#13291f",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  margin: "0 auto 12px",
  fontSize: "32px",
  boxShadow: "0 8px 20px rgba(0,0,0,.15)",
},

logo: {
  fontSize: "48px",
  fontWeight: 900,
  letterSpacing: "6px",
  color: "#13291f",
  margin: "0",
},

tagline: {
  color: "#566b3d",
  fontWeight: 700,
  marginTop: "8px",
  marginBottom: "18px",
  lineHeight: 1.5,
},

quoteBox: {
  background: "#f5ecd9",
  border: "1px solid #d6c7a7",
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "18px",
  textAlign: "left",
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
