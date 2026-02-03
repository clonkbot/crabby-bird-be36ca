import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Score {
  _id: string;
  username: string;
  score: number;
  createdAt: number;
}

export function Leaderboard() {
  const scores = useQuery(api.scores.getLeaderboard) as Score[] | undefined;

  return (
    <div className="leaderboard-card">
      <h3>
        <span className="trophy">🏆</span>
        Top Swimmers
      </h3>

      {scores === undefined ? (
        <div className="leaderboard-loading">
          <div className="loading-fish">🐠</div>
          <span>Loading...</span>
        </div>
      ) : scores.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No scores yet!</p>
          <p className="be-first">Be the first to dive in!</p>
        </div>
      ) : (
        <ul className="leaderboard-list">
          {scores.map((score, index) => (
            <li key={score._id} className={`leaderboard-item rank-${index + 1}`}>
              <span className="rank">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
              </span>
              <span className="username">{score.username}</span>
              <span className="score">{score.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
