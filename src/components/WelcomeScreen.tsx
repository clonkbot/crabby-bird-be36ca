import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function WelcomeScreen() {
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const [username, setUsername] = useState("");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState("");
  const createPlayer = useMutation(api.players.getOrCreate);

  const handleDiveIn = async () => {
    if (!username.trim()) {
      setError("Please choose a username!");
      return;
    }
    setError("");

    if (!isAuthenticated) {
      // Sign in anonymously first
      await signIn("anonymous");
    }

    // Create player profile
    await createPlayer({ username: username.trim() });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please choose a username!");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("flow", flow);

    try {
      await signIn("password", formData);
      await createPlayer({ username: username.trim() });
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    }
  };

  return (
    <div className="welcome-screen">
      <div className="ocean-bg">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="bubble-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 6}s`
          }} />
        ))}
      </div>

      <div className="fish-container">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="swimming-fish" style={{
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}>🐠</div>
        ))}
      </div>

      <div className="welcome-content">
        <div className="welcome-card">
          <div className="title-section">
            <div className="crab-hero">🦀</div>
            <h1>Crabby Bird</h1>
            <p className="tagline">Swim through the coral reef!</p>
          </div>

          {!showAuth ? (
            <div className="quick-start">
              <div className="input-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="username-input"
                  maxLength={20}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button onClick={handleDiveIn} className="dive-button primary">
                <span className="btn-text">Dive In</span>
                <span className="btn-bubbles">
                  <span className="btn-bubble"></span>
                  <span className="btn-bubble"></span>
                  <span className="btn-bubble"></span>
                </span>
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="auth-toggle"
              >
                Or sign in with email
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="auth-form">
              <div className="input-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="username-input"
                  maxLength={20}
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="email-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="password-input"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="dive-button primary">
                <span className="btn-text">{flow === "signIn" ? "Sign In" : "Sign Up"}</span>
              </button>
              <div className="auth-switch">
                <button
                  type="button"
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                  className="switch-btn"
                >
                  {flow === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="back-btn"
                >
                  ← Quick play
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="welcome-footer">
        <span>Requested by @0xPaulius · Built by @clonkbot</span>
      </footer>
    </div>
  );
}
