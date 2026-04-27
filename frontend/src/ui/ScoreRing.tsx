export function ScoreRing({ score }: { score: number }) {
  return (
    <div className="scoreRing" style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}>
      <span>{score}</span>
      <small>%</small>
    </div>
  );
}
