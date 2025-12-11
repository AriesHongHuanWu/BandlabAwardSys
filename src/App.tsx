import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <div className="relative z-10">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
