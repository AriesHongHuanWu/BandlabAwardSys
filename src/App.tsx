import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { ProjectList } from './components/ProjectList';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      {currentProjectId ? (
        <Dashboard
          projectId={currentProjectId}
          onBack={() => setCurrentProjectId(null)}
          onLogout={logout}
        />
      ) : (
        <ProjectList onSelectProject={setCurrentProjectId} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
