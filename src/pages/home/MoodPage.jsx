import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BackHeader } from '../../components/ui';

const MOODS = [
  {val:1,emoji:'😫',label:'Awful'},
  {val:2,emoji:'😔',label:'Low'},
  {val:3,emoji:'😐',label:'Okay'},
  {val:4,emoji:'😊',label:'Good'},
  {val:5,emoji:'🤩',label:'Great'},
];

export default function MoodPage() {
  const navigate = useNavigate();
  const { setMood, showToast, logCheckIn } = useApp();
  const [mood, setLocalMood]   = useState(null);
  const [energy, setEnergy]    = useState(6);
  const [note, setNote]        = useState('');
  const energyColor = energy>=7?'var(--g500)':energy>=4?'var(--o500)':'var(--r500)';

  const save = () => {
    if (!mood) { showToast('😊 Pick a mood first'); return; }
    setMood(mood); logCheckIn();
    showToast('😊 Check-in saved! +5 XP');
    navigate('/home');
  };

  return (
    <div className="screen">
      <BackHeader onBack={()=>navigate('/home')} title="Daily Check-in"/>

      <div className="screen__scroll" style={{padding:'0 20px'}}>
        <div style={{marginBottom:24}}>
          <h2 style={{fontSize:22,fontWeight:900,color:'var(--ink)',marginBottom:6}}>How are you feeling right now?</h2>
          <p style={{fontSize:14,color:'var(--ink3)'}}>Your mood shapes your day's focus plan</p>
        </div>

        {/* Mood grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:20}}>
          {MOODS.map(m=>(
            <button key={m.val} onClick={()=>setLocalMood(m.val)}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                padding:'12px 4px',borderRadius:14,border:`2px solid ${mood===m.val?'var(--p500)':'var(--border)'}`,
                background:mood===m.val?'var(--p50)':'var(--surf2)',cursor:'pointer',
                fontSize:11,fontWeight:600,color:mood===m.val?'var(--p500)':'var(--ink3)',
                fontFamily:'var(--font)',transition:'all .15s'}}>
              <span style={{fontSize:28}}>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {mood && (
          <div style={{textAlign:'center',marginBottom:20,fontSize:20,fontWeight:800,color:'var(--p500)'}}>
            {MOODS.find(m=>m.val===mood)?.emoji} Feeling {MOODS.find(m=>m.val===mood)?.label}
          </div>
        )}

        {/* Energy slider */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:700,color:'var(--ink)'}}>Energy level</div>
            <span style={{fontSize:22,fontWeight:900,color:energyColor}}>{energy}/10</span>
          </div>
          <div style={{background:'var(--surf2)',borderRadius:16,padding:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--ink3)',marginBottom:12}}>
              <span>😴 Exhausted</span><span>⚡ Energized</span>
            </div>
            <input type="range" min={1} max={10} value={energy}
              onChange={e=>setEnergy(parseInt(e.target.value))}
              style={{width:'100%',height:7,borderRadius:999,appearance:'none',
                background:`linear-gradient(to right,${energyColor} ${energy*10}%,var(--border) ${energy*10}%)`,
                outline:'none',WebkitAppearance:'none'}}/>
            <div style={{textAlign:'center',marginTop:12,fontSize:13,color:'var(--ink3)'}}>
              {energy>=8?'High energy — great time for deep focus!'
               :energy>=5?'Moderate energy — try 25 min focus sessions'
               :'Low energy — start with 10 min micro-sessions'}
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:10}}>
            Anything on your mind? <span style={{fontSize:12,color:'var(--ink3)',fontWeight:500}}>(optional)</span>
          </div>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            style={{width:'100%',padding:'14px 16px',border:'2px solid var(--border)',borderRadius:14,
              fontSize:14,fontFamily:'var(--font)',background:'var(--surf2)',color:'var(--ink)',
              resize:'none',height:100,outline:'none'}}
            placeholder="Just for you — no judgment here…"/>
        </div>

        {/* Encouragement — no fabricated stats */}
        <div style={{background:'var(--p50)',border:'1px solid var(--p100)',borderRadius:14,padding:'14px 16px',marginBottom:24}}>
          <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.55}}>
            💡 Tracking your mood daily — even briefly — helps you and your care team spot patterns
            over time that are easy to miss day-to-day.
          </p>
        </div>

        <div style={{height:8}}/>
      </div>

      <div className="sticky-footer">
        <button onClick={save}
          style={{width:'100%',padding:17,borderRadius:999,border:'none',
            background:mood?'var(--g500)':'var(--surf3)',
            color:mood?'#fff':'var(--ink3)',fontSize:16,fontWeight:700,cursor:'pointer',
            fontFamily:'var(--font)',boxShadow:mood?'0 8px 24px rgba(0,179,125,.3)':'none',
            transition:'all .2s'}}>
          {mood?`Save Check-in ✓ (${MOODS.find(m=>m.val===mood)?.label})`:'Select a mood first'}
        </button>
      </div>
    </div>
  );
}
