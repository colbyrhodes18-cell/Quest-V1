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
    const { error } = await supabase.auth.signUp({ email, password });

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
    <div style={styles.sunGlow} />
    <div style={styles.mountainsBack} />
    <div style={styles.mountainsFront} />
    <div style={styles.lake} />
    <div style={styles.treeLeft}>🌲</div>
    <div style={styles.treeRight}>🌲</div>
    <div style={styles.compassWatermark}>✦</div>

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
          <p style={styles.quoteText}>{quote}</p>
        </div>

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
          Sign In
        </button>

        <button style={styles.secondaryButton} onClick={signUp}>
          Create Account
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
 page: {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  background: `
    radial-gradient(circle at top right, rgba(217,164,65,.25), transparent 25%),
    radial-gradient(circle at bottom left, rgba(19,41,31,.15), transparent 35%),
    #f5ecd9
  `,
  padding: "20px",
},
  
sunGlow: {
  position: "absolute",
  top: "5%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "800px",
  height: "400px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(255,220,140,.35) 0%, rgba(255,220,140,.15) 40%, transparent 75%)",
  pointerEvents: "none",
},

mountainsBack: {
  position: "absolute",
  bottom: "160px",
  left: 0,
  right: 0,
  height: "240px",
  background:
    "linear-gradient(to top, rgba(90,110,90,.18), rgba(90,110,90,.05))",
  clipPath:
    "polygon(0% 100%, 0% 55%, 12% 35%, 24% 60%, 40% 20%, 55% 65%, 70% 30%, 84% 58%, 100% 40%, 100% 100%)",
  pointerEvents: "none",
},

mountainsFront: {
  position: "absolute",
  bottom: "110px",
  left: 0,
  right: 0,
  height: "220px",
  background:
    "linear-gradient(to top, rgba(60,80,60,.25), rgba(60,80,60,.08))",
  clipPath:
    "polygon(0% 100%, 0% 60%, 15% 40%, 30% 70%, 45% 25%, 60% 68%, 78% 35%, 90% 58%, 100% 45%, 100% 100%)",
  pointerEvents: "none",
},

lake: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "130px",
  background:
    "linear-gradient(to bottom, rgba(220,220,220,.15), rgba(180,180,180,.25))",
  pointerEvents: "none",
},

treeLeft: {
  position: "absolute",
  bottom: "120px",
  left: "3%",
  fontSize: "140px",
  opacity: 0.18,
  pointerEvents: "none",
},

treeRight: {
  position: "absolute",
  bottom: "120px",
  right: "3%",
  fontSize: "140px",
  opacity: 0.18,
  pointerEvents: "none",
},

compassWatermark: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "700px",
  opacity: 0.03,
  color: "#13291f",
  pointerEvents: "none",
}, 
  
 card: {
  position: "relative",
  zIndex: 10,
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

  quoteText: {
    margin: "8px 0 0",
    color: "#334536",
    lineHeight: 1.4,
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid #d6c7a7",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  passwordWrap: {
    position: "relative",
    marginBottom: "12px",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 48px 14px 14px",
    borderRadius: "12px",
    border: "1px solid #d6c7a7",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
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

  message: {
    marginTop: "12px",
    color: "#13291f",
    fontWeight: 700,
  },
};
