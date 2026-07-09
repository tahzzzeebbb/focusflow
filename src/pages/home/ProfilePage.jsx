import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BottomNav } from '../../components/ui';
import { getRiskLevel, DATASET } from '../../services/adhdEngine';

function buildAchievements({ score, streak, totalTasksCompleted, totalFocusMinutes }) {
  return [
    { icon:'🧠', label:'Brain Unlocked',   sub:'Complete your ADHD assessment', earned: !!score,                         color:'var(--p50)' },
    { icon:'🔥', label:'Week Warrior',     sub:'7-day check-in streak',          earned: streak >= 7,                    color:'var(--o50)', progress: Math.min(streak,7), goal:7 },
    { icon:'✅', label:'Task Master',      sub:'Complete 50 tasks',              earned: totalTasksCompleted >= 50,      color:'var(--g50)', progress: Math.min(totalTasksCompleted,50), goal:50 },
    { icon:'🚀', label:'30-Day Champion',  sub:'30-day check-in streak',         earned: streak >= 30,                   color:'var(--surf2)', progress: Math.min(streak,30), goal:30 },
    { icon:'💎', label:'Focus Legend',     sub:'100 hours total focus',          earned: totalFocusMinutes >= 6000,      color:'var(--surf2)', progress: Math.min(totalFocusMinutes,6000), goal:6000 },
  ];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, score, streak, xp, totalTasksCompleted, totalFocusMinutes, showToast, setUser } = useApp();
  const risk = score ? getRiskLevel(score) : null;
  const achievements = buildAchievements({ score, streak, totalTasksCompleted, totalFocusMinutes });
  const earnedCount = achievements.filter(a => a.earned).length;

  const handleLogout = () => {
    if (window.confirm('Sign out of FocusFlow?')) {
      setUser(null); showToast('👋 See you tomorrow!');
      setTimeout(()=>navigate('/welcome'),600);
    }
  };

  return (
    <div className="screen">
      <div className="screen__scroll">
        {/* Hero */}
        <div style={{background:'linear-gradient(160deg,#4535B8,#6C5CE7)',padding:'56px 24px 28px'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,
              border:'3px solid rgba(255,255,255,.4)'}}>
              {(user?.name||'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:900,color:'#fff'}}>{user?.name}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>{user?.email}</div>
              {risk&&<span style={{marginTop:6,display:'inline-block',background:'rgba(255,255,255,.15)',color:'#fff',
                padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>
                {risk.emoji} {risk.label}
              </span>}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[{val:`${streak}🔥`,label:'Streak'},{val:`${xp}⚡`,label:'Total XP'},{val:`${earnedCount}🏆`,label:'Badges'}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,.15)',borderRadius:14,padding:'12px 8px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900,color:'#fff'}}>{s.val}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.65)',textTransform:'uppercase',letterSpacing:'.4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'20px 20px 0'}}>
          {/* Score */}
          {score&&(
            <div onClick={()=>navigate('/result')} style={{background:'var(--p50)',border:'1px solid var(--p100)',
              borderRadius:18,padding:'16px 18px',marginBottom:16,display:'flex',
              justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
              <div>
                <div style={{fontSize:13,color:'var(--ink3)',fontWeight:600,marginBottom:4}}>ADHD Risk Score (from {DATASET.total.toLocaleString()} patients)</div>
                <div style={{fontSize:28,fontWeight:900,color:'var(--p500)'}}>{score}%</div>
                <div style={{fontSize:12,color:'var(--ink3)'}}>{risk?.label} · Tap to view full report</div>
              </div>
              <div style={{fontSize:44}}>🧠</div>
            </div>
          )}

          {/* Achievements */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:17,fontWeight:800,color:'var(--ink)',marginBottom:12}}>Achievements</div>
            {achievements.map(a=>(
              <div key={a.label} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',
                background:'var(--surf)',border:'1px solid var(--border)',borderRadius:16,
                marginBottom:8,opacity:a.earned?1:.7}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:a.color,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                  {a.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--ink)'}}>{a.label}</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>{a.sub}</div>
                  {!a.earned && a.goal && (
                    <div style={{marginTop:6,height:5,background:'var(--surf3)',borderRadius:99,width:120}}>
                      <div style={{height:'100%',width:`${(a.progress/a.goal)*100}%`,background:'var(--p300)',borderRadius:99}}/>
                    </div>
                  )}
                </div>
                {a.earned
                  ?<span className="ui-badge ui-badge--green">Earned</span>
                  :<span className="ui-badge ui-badge--dark">{a.progress}/{a.goal}</span>}
              </div>
            ))}
          </div>

          {/* Menu */}
          {[
            {icon:'🔁',label:'Retake Assessment',sub:'Update your ADHD score', onClick:()=>navigate('/q1')},
            {icon:'🕸️',label:'Knowledge Graph',   sub:'Treatment → Outcome graph', onClick:()=>navigate('/graph')},
            {icon:'🔬',label:'Lab Test Recs',     sub:'Evidence-based recommendations', onClick:()=>navigate('/labtest')},
            {icon:'💊',label:'Medication Setup',  sub:'Ritalin 10mg · 9:00 AM', onClick:()=>showToast('💊 Coming soon!')},
            {icon:'⚙️',label:'Settings',          sub:'Theme, language, data', onClick:()=>showToast('⚙️ Coming soon!')},
          ].map(item=>(
            <div key={item.label} onClick={item.onClick}
              style={{display:'flex',alignItems:'center',gap:14,padding:'15px 16px',
                background:'var(--surf)',border:'1px solid var(--border)',borderRadius:16,
                marginBottom:8,cursor:'pointer'}}>
              <div style={{width:44,height:44,borderRadius:12,background:'var(--surf2)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{item.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--ink)'}}>{item.label}</div>
                <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>{item.sub}</div>
              </div>
              <span style={{color:'var(--ink3)',fontSize:18}}>›</span>
            </div>
          ))}

          {/* Logout */}
          <div onClick={handleLogout}
            style={{display:'flex',alignItems:'center',gap:14,padding:'15px 16px',
              background:'var(--r50)',border:'1px solid var(--r300)',borderRadius:16,
              marginBottom:32,cursor:'pointer'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'var(--r50)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🚪</div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--r500)'}}>Sign Out</div>
          </div>
        </div>
        <div style={{height:20}}/>
      </div>
      <BottomNav active="profile" onNavigate={navigate}/>
    </div>
  );
}
