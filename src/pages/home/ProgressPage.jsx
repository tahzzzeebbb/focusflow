import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BottomNav, ScoreRing } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getRiskLevel } from '../../services/adhdEngine';
import './ProgressPage.css';

// Example-only chart shapes — used purely to show what these charts will
// look like once real daily history exists. Never presented as this
// user's actual data (see the "Example" badge + caption on each one).
const exampleFocusData = [
  {day:'Mon',mins:20},{day:'Tue',mins:35},{day:'Wed',mins:15},
  {day:'Thu',mins:40},{day:'Fri',mins:25},{day:'Sat',mins:50},{day:'Sun',mins:30},
];
const exampleMoodData = [
  {day:'Mon',mood:3},{day:'Tue',mood:4},{day:'Wed',mood:3},
  {day:'Thu',mood:2},{day:'Fri',mood:4},{day:'Sat',mood:5},{day:'Sun',mood:4},
];

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:'#1A1035',color:'#fff',padding:'10px 14px',borderRadius:12,fontSize:12}}>
      <strong>{label}</strong>
      {payload.map((p,i)=><div key={i} style={{color:p.color||'#fff'}}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

function formatMinutes(mins) {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const { score, streak, tasks, totalFocusMinutes, totalTasksCompleted, checkInsCount } = useApp();
  const risk = score ? getRiskLevel(score) : null;
  const doneToday = tasks.filter(t=>t.done).length;

  const hasRealHistory = totalFocusMinutes > 0 || totalTasksCompleted > 0 || checkInsCount > 0;

  return (
    <div className="screen">
      <div className="screen__scroll">
        <div className="prog-top">
          <h1 className="prog-title">Progress</h1>
          <span className="ui-badge ui-badge--purple">This session</span>
        </div>

        {/* Real KPIs — from actual state, not invented numbers */}
        <div className="prog-kpis">
          {[
            {label:'Focus Time',   val:formatMinutes(totalFocusMinutes), icon:'⏱️', color:'var(--p500)'},
            {label:'Tasks Done',   val:`${totalTasksCompleted}`,         icon:'✅', color:'var(--g500)'},
            {label:'Day Streak',   val:`${streak}🔥`,                    icon:'🔥', color:'var(--o500)'},
          ].map(k=>(
            <div key={k.label} className="prog-kpi">
              <div className="prog-kpi__icon">{k.icon}</div>
              <div className="prog-kpi__val" style={{color:k.color}}>{k.val}</div>
              <div className="prog-kpi__label">{k.label}</div>
            </div>
          ))}
        </div>

        {!hasRealHistory && (
          <div className="prog-empty-note">
            💡 These numbers update as you use FocusFlow — complete a focus session or check a task to see them grow.
          </div>
        )}

        {/* Focus chart — clearly labeled as an example, not real history */}
        <div className="r-card prog-card">
          <div className="r-card__head">
            <div className="r-card__icon" style={{background:'var(--p50)'}}>📊</div>
            <div style={{flex:1}}>
              <h3 className="r-card__title">Daily focus (example)</h3>
              <p className="r-card__sub">A preview of what your weekly chart will look like</p>
            </div>
            <span className="ui-badge ui-badge--dark" style={{flexShrink:0}}>Example</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={exampleFocusData} margin={{top:5,right:0,bottom:0,left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--ink3)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'var(--ink3)'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="mins" name="Minutes" fill="var(--p200)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <p className="prog-card__footnote">Illustrative only — your real chart builds up day by day as you complete focus sessions.</p>
        </div>

        {/* Mood chart — same honesty treatment */}
        <div className="r-card prog-card">
          <div className="r-card__head">
            <div className="r-card__icon" style={{background:'var(--g50)'}}>💭</div>
            <div style={{flex:1}}>
              <h3 className="r-card__title">Mood trend (example)</h3>
              <p className="r-card__sub">Scale: 1 (awful) → 5 (great)</p>
            </div>
            <span className="ui-badge ui-badge--dark" style={{flexShrink:0}}>Example</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={exampleMoodData} margin={{top:5,right:0,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--g300)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--g300)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--ink3)'}} axisLine={false} tickLine={false}/>
              <YAxis domain={[1,5]} tick={{fontSize:10,fill:'var(--ink3)'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="mood" name="Mood" stroke="var(--g300)" strokeWidth={2.5}
                fill="url(#mg)" dot={{r:4,fill:'var(--g300)',strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
          <p className="prog-card__footnote">Check in on the Home tab daily and this fills in with your real mood history.</p>
        </div>

        {/* ADHD score card — this one IS real, from the actual assessment */}
        {score && (
          <div className="prog-score-card" style={{background:risk.gradient}} onClick={()=>navigate('/result')}>
            <ScoreRing score={score} size={90}/>
            <div style={{color:'#fff'}}>
              <div style={{fontSize:12,opacity:.75,marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px'}}>ADHD Risk Score</div>
              <div style={{fontSize:20,fontWeight:900}}>{risk.label}</div>
              <div style={{fontSize:12,opacity:.8,marginTop:4}}>From your real assessment · Tap for full report</div>
            </div>
          </div>
        )}

        {/* Encouragement — honest, no fabricated stats */}
        <div className="prog-encourage">
          <div className="prog-encourage__title">💪 Keep it up</div>
          <p>
            You're on a <strong>{streak}-day streak</strong>. Consistency — showing up daily, even briefly —
            is one of the most well-supported ways to build focus habits for ADHD. Small, repeated actions
            beat occasional big pushes.
          </p>
        </div>

        <div style={{height:20}}/>
      </div>
      <BottomNav active="progress" onNavigate={navigate}/>
    </div>
  );
}
