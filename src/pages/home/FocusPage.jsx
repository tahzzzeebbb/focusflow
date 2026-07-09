import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BottomNav } from '../../components/ui';

const MODES = [
  {label:'Focus',      mins:25,color:'#6C5CE7'},
  {label:'Short Break',mins:5, color:'#00B37D'},
  {label:'Long Break', mins:15,color:'#4A90D9'},
];

export default function FocusPage() {
  const navigate = useNavigate();
  const { showToast, logFocusSession } = useApp();
  const [modeIdx, setModeIdx] = useState(0);
  const [secs, setSecs]       = useState(25*60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(2);
  const iv = useRef(null);
  const mode = MODES[modeIdx];
  const total = mode.mins*60;
  const pct = ((total-secs)/total)*100;
  const circ = 2*Math.PI*90;
  const offset = circ*(1-pct/100);
  const mm = String(Math.floor(secs/60)).padStart(2,'0');
  const ss = String(secs%60).padStart(2,'0');

  useEffect(()=>{setSecs(mode.mins*60);setRunning(false);clearInterval(iv.current);},[modeIdx]);
  useEffect(()=>{
    if(running){
      iv.current=setInterval(()=>{
        setSecs(s=>{
          if(s<=1){clearInterval(iv.current);setRunning(false);setSessions(n=>n+1);if(mode.label==='Focus'){logFocusSession(mode.mins);}showToast(mode.label==='Focus'?'🎯 Session complete! +50 XP 🔥':'☕ Break complete!');return 0;}
          return s-1;
        });
      },1000);
    } else clearInterval(iv.current);
    return ()=>clearInterval(iv.current);
  },[running]);

  return (
    <div className="screen" style={{background:`linear-gradient(180deg,${mode.color}18 0%,var(--surf) 40%)`}}>
      <div className="screen__scroll">
        <div style={{padding:'52px 20px 16px',textAlign:'center'}}>
          <h1 style={{fontSize:24,fontWeight:900,color:'var(--ink)'}}>Focus Session</h1>
          <p style={{fontSize:13,color:'var(--ink3)',marginTop:4}}>{sessions} sessions today · Keep going! 🔥</p>
        </div>

        {/* Real data note */}
        <div style={{margin:'0 20px 20px',background:'var(--surf2)',borderRadius:12,padding:'10px 14px',display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:14}}>📊</span>
          <span style={{fontSize:12,color:'var(--ink2)'}}>The Pomodoro technique breaks work into short, timed sprints — this fits how ADHD attention naturally cycles, instead of fighting it.</span>
        </div>

        {/* Mode tabs */}
        <div style={{display:'flex',gap:6,padding:'0 20px',marginBottom:28,justifyContent:'center'}}>
          {MODES.map((m,i)=>(
            <button key={i} onClick={()=>setModeIdx(i)}
              style={{padding:'9px 16px',borderRadius:999,border:'none',fontSize:13,fontWeight:700,
                background:modeIdx===i?mode.color:'var(--surf2)',
                color:modeIdx===i?'#fff':'var(--ink3)',cursor:'pointer'}}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
          <div style={{position:'relative',width:220,height:220}}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="90" fill="none" stroke="var(--surf3)" strokeWidth="10"/>
              <circle cx="110" cy="110" r="90" fill="none" stroke={mode.color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                transform="rotate(-90 110 110)" style={{transition:'stroke-dashoffset .5s linear'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:48,fontWeight:900,color:'var(--ink)',fontVariantNumeric:'tabular-nums',letterSpacing:'-2px'}}>{mm}:{ss}</div>
              <div style={{fontSize:13,color:'var(--ink3)',fontWeight:600,marginTop:4}}>{mode.label}</div>
            </div>
          </div>
        </div>

        {/* Session dots */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:28,alignItems:'center'}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:14,height:14,borderRadius:'50%',background:i<sessions?mode.color:'var(--border)'}}/>
          ))}
          <span style={{fontSize:12,color:'var(--ink3)',fontWeight:600,marginLeft:6}}>{sessions}/4 sessions</span>
        </div>

        {/* Controls */}
        <div style={{display:'flex',gap:16,justifyContent:'center',alignItems:'center',marginBottom:28}}>
          <button onClick={()=>{setSecs(mode.mins*60);setRunning(false);}}
            style={{width:52,height:52,borderRadius:'50%',background:'var(--surf2)',border:'none',fontSize:20,cursor:'pointer'}}>⏮</button>
          <button onClick={()=>setRunning(r=>!r)}
            style={{width:72,height:72,borderRadius:'50%',background:mode.color,border:'none',fontSize:28,
              cursor:'pointer',color:'#fff',boxShadow:`0 8px 24px ${mode.color}55`}}>
            {running?'⏸':'▶'}
          </button>
          <button onClick={()=>{setSecs(0);setRunning(false);showToast('⏭ Session skipped');}}
            style={{width:52,height:52,borderRadius:'50%',background:'var(--surf2)',border:'none',fontSize:20,cursor:'pointer'}}>⏭</button>
        </div>

        {/* Stats */}
        <div style={{margin:'0 20px 24px',background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:'18px 20px'}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>Today's Focus</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[{label:'Sessions',val:sessions,icon:'🍅'},{label:'Focus time',val:`${sessions*25}m`,icon:'⏱️'},{label:'XP earned',val:`+${sessions*50}`,icon:'⚡'}].map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:22}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:900,color:mode.color}}>{s.val}</div>
                <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'.4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:20}}/>
      </div>
      <BottomNav active="focus" onNavigate={navigate}/>
    </div>
  );
}
