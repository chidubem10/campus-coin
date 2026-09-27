import './LoadingScreen.css';

export default function LoadingScreen({ label = 'Loading your campus wallet…' }) {
  return (
    <div className="loading-screen">
      <div className="coin-flip">
        <div className="coin-flip__face coin-flip__face--front">₵</div>
        <div className="coin-flip__face coin-flip__face--back">CC</div>
      </div>
      <p className="loading-screen__label">{label}</p>
    </div>
  );
}
