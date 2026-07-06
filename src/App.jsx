import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toast } from './components/ui';

// Pages — FocusFlow flow
import SplashPage      from './pages/SplashPage';
import WelcomePage     from './pages/WelcomePage';
import AuthPage        from './pages/AuthPage';

// Assessment
import Q1Page          from './pages/assessment/Q1Page';
import Q2Page          from './pages/assessment/Q2Page';
import Q3Page          from './pages/assessment/Q3Page';
import Q4Page          from './pages/assessment/Q4Page';
import Q5Page          from './pages/assessment/Q5Page';
import Q6Page          from './pages/assessment/Q6Page';
import Q7Page          from './pages/assessment/Q7Page';
import CalculatingPage from './pages/assessment/CalculatingPage';
import ResultPage      from './pages/assessment/ResultPage';

// Main app tabs
import HomePage        from './pages/home/HomePage';
import TasksPage       from './pages/home/TasksPage';
import FocusPage       from './pages/home/FocusPage';
import ProgressPage    from './pages/home/ProgressPage';
import ProfilePage     from './pages/home/ProfilePage';
import JournalPage     from './pages/home/JournalPage';
import ChatPage        from './pages/home/ChatPage';
import MoodPage        from './pages/home/MoodPage';

// Clinical tools (Neo4j connected)
import GraphPage       from './pages/clinical/GraphPage';
import QueryPage       from './pages/clinical/QueryPage';
import LabTestPage     from './pages/clinical/LabTestPage';
import AnalyticsPage   from './pages/clinical/AnalyticsPage';

import './styles/tokens.css';
import './App.css';

function AppInner() {
  const { toast } = useApp();
  return (
    <>
      <Routes>
        <Route path="/"              element={<SplashPage />} />
        <Route path="/welcome"       element={<WelcomePage />} />
        <Route path="/auth"          element={<AuthPage />} />
        <Route path="/q1"            element={<Q1Page />} />
        <Route path="/q2"            element={<Q2Page />} />
        <Route path="/q3"            element={<Q3Page />} />
        <Route path="/q4"            element={<Q4Page />} />
        <Route path="/q5"            element={<Q5Page />} />
        <Route path="/q6"            element={<Q6Page />} />
        <Route path="/q7"            element={<Q7Page />} />
        <Route path="/calculating"   element={<CalculatingPage />} />
        <Route path="/result"        element={<ResultPage />} />
        <Route path="/home"          element={<HomePage />} />
        <Route path="/tasks"         element={<TasksPage />} />
        <Route path="/focus"         element={<FocusPage />} />
        <Route path="/progress"      element={<ProgressPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
        <Route path="/journal"       element={<JournalPage />} />
        <Route path="/chat"          element={<ChatPage />} />
        <Route path="/mood"          element={<MoodPage />} />
        <Route path="/graph"         element={<GraphPage />} />
        <Route path="/query"         element={<QueryPage />} />
        <Route path="/labtest"       element={<LabTestPage />} />
        <Route path="/analytics"     element={<AnalyticsPage />} />
        <Route path="*"              element={<Navigate to="/" />} />
      </Routes>
      <Toast message={toast.msg} visible={toast.visible} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AuthProvider>
  );
}
