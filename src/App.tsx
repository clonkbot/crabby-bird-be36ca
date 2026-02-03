import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Leaderboard } from "./components/Leaderboard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const player = useQuery(api.players.getCurrent);
  const [gameStarted, setGameStarted] = useState(false);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="bubble-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bubble" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        <div className="loading-content">
          <div className="crab-loader">🦀</div>
          <p>Diving in...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !player) {
    return <WelcomeScreen />;
  }

  return (
    <div className="app-container">
      <div className="ocean-bg">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <header className="game-header">
        <div className="header-left">
          <span className="crab-icon">🦀</span>
          <h1>Crabby Bird</h1>
        </div>
        <div className="header-right">
          <span className="player-name">{player.username}</span>
          <span className="high-score">Best: {player.highScore}</span>
          <button onClick={() => signOut()} className="sign-out-btn">
            Surface
          </button>
        </div>
      </header>

      <main className="game-main">
        {gameStarted ? (
          <GameScreen
            username={player.username}
            onGameEnd={() => setGameStarted(false)}
          />
        ) : (
          <div className="game-lobby">
            <div className="lobby-card">
              <div className="card-decoration">
                <div className="coral coral-1"></div>
                <div className="coral coral-2"></div>
                <div className="seaweed seaweed-1"></div>
                <div className="seaweed seaweed-2"></div>
              </div>
              <div className="lobby-content">
                <div className="big-crab">🦀</div>
                <h2>Ready to Swim?</h2>
                <p>Navigate through the coral reef without hitting the obstacles!</p>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">{player.highScore}</span>
                    <span className="stat-label">High Score</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{player.gamesPlayed}</span>
                    <span className="stat-label">Games Played</span>
                  </div>
                </div>
                <button
                  onClick={() => setGameStarted(true)}
                  className="dive-button"
                >
                  <span className="btn-text">Dive In!</span>
                  <span className="btn-bubbles">
                    <span className="btn-bubble"></span>
                    <span className="btn-bubble"></span>
                    <span className="btn-bubble"></span>
                  </span>
                </button>
              </div>
            </div>
            <Leaderboard />
          </div>
        )}
      </main>

      <footer className="game-footer">
        <span>Requested by @0xPaulius · Built by @clonkbot</span>
      </footer>
    </div>
  );
}
