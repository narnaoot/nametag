// PronounChips.jsx — single-select pronoun chip row, shared by Onboarding and
// My Tag. The parent owns the options list, the selected value, and what a tap
// does (My Tag selects; Onboarding toggles to clear). A "custom" option renders
// as "+ custom"; its accompanying text input stays in the parent.

export default function PronounChips({ options, value, onChange, justify = 'flex-start' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: justify }}>
      {options.map(opt => (
        <button key={opt} type="button" className="na-chip"
          data-on={value === opt ? 'true' : 'false'}
          onClick={() => onChange(opt)}>
          {opt === 'custom' ? '+ custom' : opt}
        </button>
      ))}
    </div>
  );
}
