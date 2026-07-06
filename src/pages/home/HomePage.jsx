import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BottomNav, ProgBar } from '../../components/ui';
import { getRiskLevel } from '../../services/adhdEngine';
import './Home.css';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FOCUS = [45,30,70,55,80,60,90];

export default function HomePage() {
  const navigate = useNavigate();
  const { score, streak, xp, tasks, toggleTask, showToast, user } = useApp();
  const risk  = score ? getRiskLevel(score) : null;
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;

  return (
    <div className="screen">
      <div className="screen__scroll">

        {/* ── STATUS BAR ── */}
        <div className="home-status">
          <div>
            <p style={{fontSize:13,color:'var(--ink3)',fontWeight:500}}>Good morning 👋</p>
            <h1 style={{fontSize:26,fontWeight:900,color:'var(--ink)',letterSpacing:'-.4px'}}>
              {user?.name || 'Alex'}
            </h1>
          </div>
          <button className="home-notif" onClick={() => showToast('🔔 No new notifications')}>
            🔔
            <span className="home-notif__dot"/>
          </button>
        </div>

        {/* ── SCORE HERO ── */}
        {score ? (
          <div className="home-hero" style={{background:risk.gradient}} onClick={() => navigate('/result')}>
            <div>
              <p style={{fontSize:12,color:'rgba(255,255,255,.75)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px'}}>
                Your ADHD Risk Score
              </p>
              <div style={{fontSize:46,fontWeight:900,color:'#fff',lineHeight:1}}>{score}%</div>
              <p style={{fontSize:13,color:'rgba(255,255,255,.85)',marginTop:4}}>{risk.label} · Tap for full report</p>
              <div style={{marginTop:10,height:5,background:'rgba(255,255,255,.25)',borderRadius:99}}>
                <div style={{height:'100%',width:`${score}%`,background:'rgba(255,255,255,.9)',borderRadius:99}}/>
              </div>
            </div>
            <span style={{fontSize:52,filter:'drop-shadow(0 4px 16px rgba(0,0,0,.2))'}}>🧠</span>
          </div>
        ) : (
          <div className="home-hero home-hero--empty" onClick={() => navigate('/q1')}>
            <div>
              <p style={{fontSize:15,fontWeight:800,color:'var(--p500)'}}>Take your ADHD Assessment →</p>
              <p style={{fontSize:13,color:'var(--ink3)',marginTop:4}}>Real score from 2,000 patient dataset</p>
            </div>
            <span style={{fontSize:40}}>🎯</span>
          </div>
        )}

        {/* ── REAL DATA PILL ── */}
        {score && (
          <div style={{margin:'0 20px 16px',background:'var(--surf2)',borderRadius:12,padding:'10px 14px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:16}}>📊</span>
            <span style={{fontSize:12,color:'var(--ink2)',lineHeight:1.4}}>
              Score computed from <strong>2,000 real ADHD patients</strong> — inattention, hyperactivity & impulsivity rates validated against clinical diagnoses
            </span>
          </div>
        )}

        {/* ── STREAK + XP + TASKS ── */}
        <div className="home-stats">
          {[
            {emoji:'🔥',val:streak,      sub:'Day Streak', color:'var(--o500)'},
            {emoji:'⚡',val:xp,          sub:'Total XP',   color:'var(--p500)'},
            {emoji:'✅',val:`${done}/${total}`,sub:'Tasks Done',color:'var(--g500)'},
          ].map(s => (
            <div key={s.sub} className="home-stat">
              <span style={{fontSize:24}}>{s.emoji}</span>
              <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
              <div style={{fontSize:9,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'.4px'}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MOOD CHECK-IN ── */}
        <div className="section">
          <div className="home-mood-card" onClick={() => navigate('/mood')}>
            <span style={{fontSize:32}}>😊</span>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:'var(--ink)'}}>Daily Check-in</div>
              <div style={{fontSize:13,color:'var(--ink3)',marginTop:2}}>How are you feeling right now? · 30 sec</div>
            </div>
            <span style={{fontSize:20,color:'var(--p500)'}}>→</span>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Quick Actions</span>
          </div>
          <div className="quick-actions">
            {[
              {emoji:'⏱️',label:'Focus',   bg:'var(--p50)',   path:'/focus'},
              {emoji:'✅',label:'Tasks',   bg:'var(--g50)',   path:'/tasks'},
              {emoji:'📓',label:'Journal', bg:'var(--o50)',   path:'/journal'},
              {emoji:'🤖',label:'AI Chat', bg:'var(--surf3)', path:'/chat'},
            ].map(a => (
              <button key={a.label} className="quick-action" style={{background:a.bg}}
                onClick={() => navigate(a.path)}>
                <span style={{fontSize:26}}>{a.emoji}</span>
                <span style={{fontSize:11,fontWeight:700,color:'var(--ink2)'}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CLINICAL TOOLS (Neo4j powered) ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Clinical Tools</span>
            <span className="ui-badge ui-badge--green" style={{fontSize:10}}>Neo4j AuraDB</span>
          </div>
          <div style={{background:'var(--ink)',borderRadius:20,padding:20,overflow:'hidden',position:'relative'}}>
            <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(162,155,254,.1)'}}/>
            <p style={{fontSize:12,color:'rgba(255,255,255,.6)',marginBottom:14,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>
              Powered by 2,000 real patients + Neo4j graph
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {emoji:'🕸️',label:'Knowledge Graph',    sub:'Treatment → Outcomes', path:'/graph',     color:'#A29BFE'},
                {emoji:'🔍',label:'Query Engine',       sub:'5 Cypher query types', path:'/query',     color:'#55D6A0'},
                {emoji:'🔬',label:'Lab Tests',          sub:'Evidence-based recs',  path:'/labtest',   color:'#FFB347'},
                {emoji:'📊',label:'Population Stats',   sub:'CSV live analytics',   path:'/analytics', color:'#FF8F8F'},
              ].map(t => (
                <button key={t.label}
                  style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',
                    borderRadius:14,padding:'14px 12px',textAlign:'left',cursor:'pointer',
                    transition:'all .15s',display:'flex',flexDirection:'column',gap:6,fontFamily:'var(--font)'}}
                  onClick={() => navigate(t.path)}
                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.12)'}
                  onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,.06)'}>
                  <span style={{fontSize:24}}>{t.emoji}</span>
                  <div style={{fontSize:13,fontWeight:700,color:t.color}}>{t.label}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TODAY'S TASKS ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Today's Tasks</span>
            <button className="section-action" onClick={() => navigate('/tasks')}>See all</button>
          </div>
          <div style={{background:'var(--p50)',borderRadius:14,padding:'12px 14px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:12,color:'var(--ink3)'}}>Progress today</span>
              <span style={{fontSize:12,fontWeight:800,color:'var(--p500)'}}>{done}/{total} done</span>
            </div>
            <ProgBar value={(done/total)*100}/>
          </div>
          {tasks.slice(0,4).map(t => (
            <div key={t.id} className="home-task"
              onClick={() => { toggleTask(t.id); if (!t.done) showToast('✅ Done! +10 XP 🎉'); }}>
              <div className={`home-task__check ${t.done?'done':''}`}>{t.done&&'✓'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--ink)',
                  textDecoration:t.done?'line-through':'none',opacity:t.done?.6:1}}>{t.text}</div>
                <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>{t.time}</div>
              </div>
              {t.priority==='high'&&!t.done&&(
                <span className="ui-badge ui-badge--red" style={{fontSize:10}}>High</span>
              )}
            </div>
          ))}
        </div>

        {/* ── REMINDERS ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Reminders</span>
            <span className="ui-badge ui-badge--orange">2 pending</span>
          </div>
          <div className="home-task" onClick={() => showToast('💊 Medication logged! +5 XP')}>
            <span style={{fontSize:28}}>💊</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700}}>Take Medication</div>
              <div style={{fontSize:12,color:'var(--ink3)'}}>9:00 AM · Ritalin 10mg</div>
            </div>
            <span className="ui-badge ui-badge--orange">Now</span>
          </div>
          <div className="home-task" style={{marginTop:8}} onClick={() => showToast('💧 Water logged! 4/8')}>
            <span style={{fontSize:28}}>💧</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Drink Water</div>
              <ProgBar value={37.5} color="#4A90D9" height={5}/>
              <div style={{fontSize:11,color:'var(--ink3)',marginTop:4}}>3/8 glasses · Goal: 8</div>
            </div>
          </div>
        </div>

        {/* ── WEEK CHART ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">This Week</span>
            <button className="section-action" onClick={() => navigate('/progress')}>Full report</button>
          </div>
          <div className="week-chart-card">
            <div className="week-chart">
              {FOCUS.map((v,i) => (
                <div key={i} className="week-chart__col">
                  <div className="week-chart__bar"
                    style={{height:`${v}px`,background:i===6?'var(--p500)':'var(--p100)'}}/>
                  <span className="week-chart__day"
                    style={{color:i===6?'var(--p500)':'var(--ink3)'}}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:20,marginTop:12}}>
              <p style={{fontSize:13,color:'var(--ink3)'}}><strong style={{color:'var(--p500)'}}>↑18%</strong> focus time</p>
              <p style={{fontSize:13,color:'var(--ink3)'}}><strong style={{color:'var(--g500)'}}>89%</strong> task rate</p>
            </div>
          </div>
        </div>

        <div style={{height:20}}/>
      </div>

      <BottomNav active="home" onNavigate={navigate}/>
    </div>
  );
}
