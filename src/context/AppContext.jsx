import { createContext, useContext, useState, useCallback } from 'react';
import { calculateRisk } from '../services/adhdEngine';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assessment, setAssessment] = useState({
    inattention: null, hyperactivity: 4, impulsivity: null,
    rsd: false, daydreaming: false,
    sleepHours: 7, screenHours: 4,
    familyHistory: false, anxiety: false, depression: false,
    educationStage: null,
  });
  const [score, setScore] = useState(null);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [mood, setMood] = useState(null);
  const [tasks, setTasks] = useState([
    { id:1, text:'Morning medication', done:true,  priority:'high',   time:'9:00 AM' },
    { id:2, text:'Reply to emails',    done:true,  priority:'medium', time:'10:00 AM'},
    { id:3, text:'Write project report',done:false, priority:'high',  time:'2:00 PM' },
    { id:4, text:'Review design specs', done:false, priority:'medium',time:'3:30 PM' },
    { id:5, text:'30 min walk',         done:false, priority:'low',   time:'6:00 PM' },
    { id:6, text:'Journal entry',       done:false, priority:'low',   time:'9:00 PM' },
  ]);
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(340);

  const updateAssessment = useCallback((key, value) => {
    setAssessment(prev => ({ ...prev, [key]: value }));
  }, []);

  const finalizeAssessment = useCallback((finalAnswers) => {
    const s = calculateRisk(finalAnswers || assessment);
    setScore(s);
    return s;
  }, [assessment]);

  const showToast = useCallback((msg, duration = 2800) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      if (nowDone) {
        setXp(x => x + 10);
        setStreak(s => s);
      }
      return { ...t, done: nowDone };
    }));
  }, []);

  const addTask = useCallback((text) => {
    setTasks(prev => [...prev, { id: Date.now(), text, done: false, priority: 'medium', time: 'Today' }]);
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      assessment, updateAssessment, finalizeAssessment,
      score, setScore,
      toast, showToast,
      mood, setMood,
      tasks, toggleTask, addTask,
      streak, xp, setXp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
