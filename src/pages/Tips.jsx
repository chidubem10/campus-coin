import { Pin, PinOff, X, Lightbulb } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useFinance } from '../context/FinanceContext';
import { generateTips } from '../utils/tips';
import './Tips.css';

export default function Tips() {
  const { transactions, categories, budgets, currentMonth, monthIncome, monthExpense, pinnedTips, dismissedTips, togglePinTip, dismissTip } =
    useFinance();

  const allTips = generateTips({ transactions, categories, budgets, currentMonth, monthIncome, monthExpense });
  const visibleTips = allTips.filter((t) => !dismissedTips.includes(t.id));
  const pinned = visibleTips.filter((t) => pinnedTips.includes(t.id));
  const others = visibleTips.filter((t) => !pinnedTips.includes(t.id));

  return (
    <div className="page">
      <TopBar title="Saving Tips" subtitle="Generated from your own spending history — ranked by potential savings." />

      {visibleTips.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No tips yet</p>
          <p className="empty-state__desc">Log a few weeks of transactions and set a budget or two — tips appear once there's enough of your own history to compare against.</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <h3 className="tips-section-heading">Pinned</h3>
              <div className="tip-list">
                {pinned.map((tip) => (
                  <TipRow key={tip.id} tip={tip} pinned onPin={() => togglePinTip(tip.id)} onDismiss={() => dismissTip(tip.id)} />
                ))}
              </div>
            </>
          )}

          <h3 className="tips-section-heading">{pinned.length > 0 ? 'More tips' : 'For you'}</h3>
          <div className="tip-list">
            {others.map((tip) => (
              <TipRow key={tip.id} tip={tip} onPin={() => togglePinTip(tip.id)} onDismiss={() => dismissTip(tip.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TipRow({ tip, pinned, onPin, onDismiss }) {
  return (
    <div className="card tip-row">
      <div className="tip-row__icon">
        <Lightbulb size={16} />
      </div>
      <p className="tip-row__text">{tip.text}</p>
      <div className="tip-row__actions">
        <button type="button" className="btn-ghost-danger" onClick={onPin} aria-label={pinned ? 'Unpin' : 'Pin'}>
          {pinned ? <PinOff size={15} /> : <Pin size={15} />}
        </button>
        <button type="button" className="btn-ghost-danger" onClick={onDismiss} aria-label="Dismiss">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
