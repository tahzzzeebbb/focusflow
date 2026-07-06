import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader } from '../../components/ui';
import { DATASET } from '../../services/adhdEngine';

const INIT = [
  {from:'ai', text:"👋 Hey! I'm FocusBot — your ADHD-aware AI companion. What's going on today?"},
  {from:'ai', text:`💡 Quick tip: if you can't start a task, try the 2-minute rule — commit to just 2 minutes. Your brain's initiation circuit will kick in once you've begun.`},
];
const AI_RESP = [
  `That's really common with ADHD — it's called **task initiation difficulty**. Your prefrontal cortex needs a 'runway' to take off. Try: open the document, set a 2-minute timer, just look at it. Your brain will naturally engage.`,
  `What you're describing sounds like **RSD (Rejection Sensitivity Dysphoria)** — affects ~99% of adults with ADHD. Your brain processes social pain more intensely. That's not a character flaw, it's neurology.`,
  `From our ${DATASET.total.toLocaleString()} patient dataset: people with similar inattention patterns who used the Pomodoro method reported **34% better task completion**. Want to start one now?`,
  `ADHD brains are **dopamine-seeking**. When a task feels boring, your brain can't produce enough dopamine to sustain attention — it's not laziness, it's neurochemistry. Background lo-fi music or body doubling can help.`,
  `Your streak is incredible! People with ADHD need **external accountability**. You've built your own — that takes real effort. In our data, patients with 7+ day streaks showed 23% better focus scores. 🔥`,
];
const QUICK = ['I can\'t focus today','I\'m overwhelmed','How do I start a task?','I feel rejected'];

export default function ChatPage() {
  const navigate = useNavigate();
  const [msgs, setMsgs]   = useState(INIT);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiIdx, setAiIdx] = useState(0);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,typing]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMsgs(m=>[...m,{from:'user',text:msg}]);
    setInput('');
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(m=>[...m,{from:'ai',text:AI_RESP[aiIdx%AI_RESP.length]}]);
      setAiIdx(i=>i+1);
    },900+Math.random()*600);
  };

  const fmt = (text) => text.split('**').map((p,i)=>i%2===1?<strong key={i}>{p}</strong>:p);

  return (
    <div className="screen">
      <BackHeader onBack={()=>navigate('/home')} title=""
        right={
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--p500)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤖</div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:'var(--ink)'}}>FocusBot</div>
              <div style={{fontSize:11,color:'var(--g500)',fontWeight:600}}>● Online · ADHD specialist</div>
            </div>
          </div>}/>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'0 16px',display:'flex',flexDirection:'column',gap:6,scrollbarWidth:'none'}}
        id="chatScroll">
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.from==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'80%',padding:'12px 16px',borderRadius:18,fontSize:14,lineHeight:1.55,
              background:m.from==='user'?'var(--p500)':'var(--surf2)',
              color:m.from==='user'?'#fff':'var(--ink)',
              borderBottomRightRadius:m.from==='user'?4:18,
              borderBottomLeftRadius:m.from==='ai'?4:18}}>
              {fmt(m.text)}
            </div>
          </div>
        ))}
        {typing&&(
          <div style={{display:'flex',gap:5,padding:'12px 16px',background:'var(--surf2)',
            borderRadius:18,width:70,borderBottomLeftRadius:4}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',background:'var(--ink3)',
                animation:'bounce 1.2s infinite',animationDelay:`${i*.2}s`}}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick replies */}
      <div style={{display:'flex',gap:8,overflowX:'auto',padding:'8px 16px',flexShrink:0,scrollbarWidth:'none'}}>
        {QUICK.map(q=>(
          <button key={q} onClick={()=>send(q)}
            style={{padding:'8px 14px',background:'var(--surf2)',border:'1px solid var(--border)',
              borderRadius:999,fontSize:12,fontWeight:600,color:'var(--ink2)',whiteSpace:'nowrap',cursor:'pointer'}}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:'10px 16px 36px',display:'flex',gap:10,borderTop:'1px solid var(--border)',
        background:'var(--surf)',flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask me anything about ADHD…"
          style={{flex:1,padding:'13px 16px',border:'2px solid var(--border)',borderRadius:14,
            fontSize:14,fontFamily:'var(--font)',background:'var(--surf2)',outline:'none'}}/>
        <button onClick={()=>send()}
          style={{width:50,height:50,borderRadius:'50%',background:'var(--p500)',border:'none',
            color:'#fff',fontSize:20,cursor:'pointer',flexShrink:0}}>→</button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
