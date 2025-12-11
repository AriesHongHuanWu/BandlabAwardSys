import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none -z-10" />
      {user ? <Dashboard user={user} /> : <Login />}
    </div>
  );
}

export default App;
