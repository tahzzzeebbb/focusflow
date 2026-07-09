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

  // Starter tasks — suggestions for a new user, NOT pre-completed.
  // A fresh account has done nothing yet; showing tasks as already
  // checked off before the user has touched the app is misleading.
  const [tasks, setTasks] = useState([
    { id:1, text:'Take morning medication', done:false, priority:'high',   time:'9:00 AM' },
    { id:2, text:'Reply to important emails',done:false, priority:'medium', time:'10:00 AM'},
    { id:3, text:'Write project report',     done:false, priority:'high',  time:'2:00 PM' },
    { id:4, text:'30 min walk',              done:false, priority:'low',   time:'6:00 PM' },
    { id:5, text:'Journal entry',            done:false, priority:'low',   time:'9:00 PM' },
  ]);

  // Real progress state — starts at zero for every new user.
  // These only grow through actual actions taken in this session
  // (completing tasks, finishing focus sessions), never pre-filled.
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [checkInsCount, setCheckInsCount] = useState(0);

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
        setTotalTasksCompleted(n => n + 1);
      } else {
        setTotalTasksCompleted(n => Math.max(0, n - 1));
      }
      return { ...t, done: nowDone };
    }));
  }, []);

  const addTask = useCallback((text) => {
    setTasks(prev => [...prev, { id: Date.now(), text, done: false, priority: 'medium', time: 'Today' }]);
  }, []);

  const logFocusSession = useCallback((minutes) => {
    setTotalFocusMinutes(m => m + minutes);
    setXp(x => x + 50);
  }, []);

  const logCheckIn = useCallback(() => {
    setCheckInsCount(c => c + 1);
    setStreak(s => s + 1); // simple model: each check-in day extends streak
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
      totalTasksCompleted, totalFocusMinutes, checkInsCount,
      logFocusSession, logCheckIn,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
