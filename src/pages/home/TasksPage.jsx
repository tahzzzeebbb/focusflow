import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BottomNav } from '../../components/ui';

export default function TasksPage() {
  const navigate = useNavigate();
  const { tasks, toggleTask, addTask, showToast } = useApp();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const done = tasks.filter(t => t.done).length;
  const filtered = filter==='done'?tasks.filter(t=>t.done):filter==='pending'?tasks.filter(t=>!t.done):tasks;

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask(newTask.trim());
    setNewTask('');
    showToast('✅ Task added! +5 XP');
  };

  return (
    <div className="screen">
      <div className="screen__scroll">
        <div style={{padding:'52px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 style={{fontSize:26,fontWeight:900,color:'var(--ink)'}}>My Tasks</h1>
          <span className="ui-badge ui-badge--green">{done}/{tasks.length} done</span>
        </div>

        {/* Progress */}
        <div style={{margin:'0 20px 16px',background:'var(--p50)',borderRadius:16,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'var(--ink2)'}}>Today's progress</span>
            <span style={{fontSize:13,fontWeight:800,color:'var(--p500)'}}>{Math.round(done/tasks.length*100)}%</span>
          </div>
          <div style={{height:8,background:'var(--p100)',borderRadius:99}}>
            <div style={{height:'100%',width:`${done/tasks.length*100}%`,background:'var(--p500)',borderRadius:99,transition:'width .6s'}}/>
          </div>
        </div>

        {/* Add task */}
        <div style={{margin:'0 20px 16px',display:'flex',gap:10}}>
          <input value={newTask} onChange={e=>setNewTask(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAdd()}
            placeholder="Add a new task…"
            style={{flex:1,padding:'13px 16px',border:'2px solid var(--border)',borderRadius:14,
              fontSize:14,fontFamily:'var(--font)',background:'var(--surf2)',outline:'none'}}/>
          <button onClick={handleAdd}
            style={{padding:'13px 18px',background:'var(--p500)',color:'#fff',border:'none',
              borderRadius:14,fontSize:20,cursor:'pointer',fontWeight:700}}>+</button>
        </div>

        {/* Filter */}
        <div style={{display:'flex',gap:6,padding:'0 20px',marginBottom:16}}>
          {['all','pending','done'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:'8px 18px',borderRadius:999,border:'none',fontSize:13,fontWeight:700,
                background:filter===f?'var(--p500)':'var(--surf2)',
                color:filter===f?'#fff':'var(--ink3)',cursor:'pointer',textTransform:'capitalize'}}>
              {f}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div style={{padding:'0 20px'}}>
          {filtered.length===0 && (
            <div style={{textAlign:'center',padding:'40px 20px',color:'var(--ink3)'}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <div style={{fontSize:16,fontWeight:700,color:'var(--ink)'}}>
                {filter==='done'?'No completed tasks yet':'All caught up!'}
              </div>
            </div>
          )}
          {filtered.map(t=>(
            <div key={t.id}
              onClick={()=>{toggleTask(t.id);if(!t.done)showToast('🎉 Task done! +10 XP');}}
              style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
                background:'var(--surf)',border:'1px solid var(--border)',borderRadius:14,
                marginBottom:8,cursor:'pointer',opacity:t.done?.65:1,transition:'all .15s'}}>
              <div style={{width:24,height:24,borderRadius:'50%',
                border:`2px solid ${t.done?'var(--g500)':'var(--border)'}`,
                background:t.done?'var(--g500)':'transparent',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'#fff',fontSize:12,flexShrink:0}}>
                {t.done&&'✓'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--ink)',
                  textDecoration:t.done?'line-through':'none'}}>{t.text}</div>
                <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>{t.time}</div>
              </div>
              <span className={`ui-badge ui-badge--${t.priority==='high'?'red':t.priority==='medium'?'purple':'green'}`}
                style={{fontSize:10}}>{t.priority}</span>
            </div>
          ))}
        </div>
        <div style={{height:20}}/>
      </div>
      <BottomNav active="tasks" onNavigate={navigate}/>
    </div>
  );
}
