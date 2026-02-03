import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface GameScreenProps {
  username: string;
  onGameEnd: () => void;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CRAB_SIZE = 40;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;

export function GameScreen({ username, onGameEnd }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [newHighScore, setNewHighScore] = useState<number | null>(null);

  const updateStats = useMutation(api.players.updateStats);

  const gameStateRef = useRef({
    crabY: GAME_HEIGHT / 2,
    crabVelocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
  });

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      gameStateRef.current.crabVelocity = JUMP_FORCE;
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const state = gameStateRef.current;

    const drawCrab = (y: number) => {
      ctx.font = `${CRAB_SIZE}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const wobble = Math.sin(Date.now() / 100) * 3;
      ctx.save();
      ctx.translate(100, y);
      ctx.rotate(Math.min(Math.max(state.crabVelocity * 0.05, -0.5), 0.5));
      ctx.fillText("🦀", wobble, 0);
      ctx.restore();
    };

    const drawPipe = (pipe: Pipe) => {
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      gradient.addColorStop(0, "#ff6b9d");
      gradient.addColorStop(0.5, "#ff8fab");
      gradient.addColorStop(1, "#ff6b9d");

      ctx.fillStyle = gradient;

      // Top coral
      ctx.beginPath();
      ctx.roundRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY - PIPE_GAP / 2, [0, 0, 15, 15]);
      ctx.fill();

      // Bottom coral
      ctx.beginPath();
      ctx.roundRect(pipe.x, pipe.gapY + PIPE_GAP / 2, PIPE_WIDTH, GAME_HEIGHT - pipe.gapY - PIPE_GAP / 2, [15, 15, 0, 0]);
      ctx.fill();

      // Coral details
      ctx.fillStyle = "#ff4081";
      for (let i = 0; i < 3; i++) {
        const dotX = pipe.x + 15 + i * 15;
        ctx.beginPath();
        ctx.arc(dotX, pipe.gapY - PIPE_GAP / 2 - 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, pipe.gapY + PIPE_GAP / 2 + 10, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBackground = () => {
      // Deep ocean gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, "#0a4d68");
      gradient.addColorStop(0.5, "#088395");
      gradient.addColorStop(1, "#05445e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Bubbles
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (let i = 0; i < 20; i++) {
        const x = (i * 47 + state.frameCount * 0.5) % (GAME_WIDTH + 20) - 10;
        const y = (GAME_HEIGHT - (i * 31 + state.frameCount) % GAME_HEIGHT);
        const size = 3 + (i % 5);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Seaweed at bottom
      ctx.fillStyle = "#2d9b5e";
      for (let i = 0; i < 8; i++) {
        const x = i * 55 + 20;
        const wave = Math.sin((state.frameCount + i * 20) / 30) * 10;
        ctx.beginPath();
        ctx.moveTo(x, GAME_HEIGHT);
        ctx.quadraticCurveTo(x + wave, GAME_HEIGHT - 40, x + 5, GAME_HEIGHT - 60);
        ctx.quadraticCurveTo(x + wave * 0.5, GAME_HEIGHT - 30, x + 10, GAME_HEIGHT);
        ctx.fill();
      }
    };

    const checkCollision = (): boolean => {
      const crabTop = state.crabY - CRAB_SIZE / 2;
      const crabBottom = state.crabY + CRAB_SIZE / 2;
      const crabLeft = 100 - CRAB_SIZE / 2;
      const crabRight = 100 + CRAB_SIZE / 2;

      if (crabTop < 0 || crabBottom > GAME_HEIGHT) return true;

      for (const pipe of state.pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;
        const gapTop = pipe.gapY - PIPE_GAP / 2;
        const gapBottom = pipe.gapY + PIPE_GAP / 2;

        if (crabRight > pipeLeft && crabLeft < pipeRight) {
          if (crabTop < gapTop || crabBottom > gapBottom) {
            return true;
          }
        }
      }

      return false;
    };

    const gameLoop = () => {
      state.frameCount++;

      drawBackground();

      if (gameStarted && !gameOver) {
        // Physics
        state.crabVelocity += GRAVITY;
        state.crabY += state.crabVelocity;

        // Spawn pipes
        if (state.frameCount % 100 === 0) {
          state.pipes.push({
            x: GAME_WIDTH,
            gapY: 100 + Math.random() * (GAME_HEIGHT - 200),
            passed: false,
          });
        }

        // Move pipes
        state.pipes = state.pipes.filter((pipe) => {
          pipe.x -= PIPE_SPEED;

          if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
            pipe.passed = true;
            state.score++;
            setScore(state.score);
          }

          return pipe.x > -PIPE_WIDTH;
        });

        // Check collision
        if (checkCollision()) {
          setGameOver(true);
          updateStats({ score: state.score }).then((high) => {
            if (high && high > state.score) {
              // Not a new high score
            } else {
              setNewHighScore(state.score);
            }
          });
        }
      }

      // Draw pipes
      state.pipes.forEach(drawPipe);

      // Draw crab
      drawCrab(state.crabY);

      // Draw score
      ctx.fillStyle = "white";
      ctx.font = "bold 32px 'Fredoka', sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.fillText(state.score.toString(), GAME_WIDTH / 2, 50);
      ctx.shadowBlur = 0;

      if (!gameStarted) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "20px 'Fredoka', sans-serif";
        ctx.fillText("Tap or Press Space to Start!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, gameOver, updateStats]);

  const restartGame = () => {
    gameStateRef.current = {
      crabY: GAME_HEIGHT / 2,
      crabVelocity: 0,
      pipes: [],
      score: 0,
      frameCount: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setNewHighScore(null);
  };

  return (
    <div className="game-screen">
      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onClick={jump}
          className="game-canvas"
        />

        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-card">
              <h2>Game Over!</h2>
              <div className="final-score">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              {newHighScore !== null && (
                <div className="new-high-score">
                  🎉 New High Score! 🎉
                </div>
              )}
              <div className="game-over-buttons">
                <button onClick={restartGame} className="retry-button">
                  Try Again
                </button>
                <button onClick={onGameEnd} className="menu-button">
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-instructions">
        <p>🖱️ Click or press <kbd>Space</kbd> to swim up!</p>
      </div>
    </div>
  );
}
