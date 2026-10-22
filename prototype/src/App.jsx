import { useState } from 'react';
import Login from './screens/Login';
import MeScreen from './screens/MeScreen';
import EoScreen from './screens/EoScreen';
import HqScreen from './screens/HqScreen';
import ResidentScreen from './screens/ResidentScreen';
import { SITES as INITIAL_SITES } from './data/sites';
import { SEED_COMPLAINTS } from './data/noise';

export default function App() {
  const [user, setUser] = useState(null);
  const [sites, setSites] = useState(INITIAL_SITES);
  const [complaints, setComplaints] = useState(SEED_COMPLAINTS);

  const handleAddSite = (newSite) => {
    setSites((prev) => [...prev, newSite]);
  };

  const handleAddComplaint = (newC) => {
    setComplaints((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        site: 'elmina',
        who: newC.who,
        issue: newC.issue,
        action: newC.action || '',
        closed: !!newC.action,
      },
      ...prev,
    ]);
  };

  const handleResolveComplaint = (id, resolutionText) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            action: resolutionText || 'Inspected perimeter; confirmed clean power baseline.',
            closed: true,
          }
          : c
      )
    );
  };

  const logout = () => setUser(null);

  if (!user) return <Login onLogin={setUser} />;

  if (user.role === 'resident') {
    return (
      <ResidentScreen
        user={user}
        complaints={complaints}
        onAddComplaint={handleAddComplaint}
        onLogout={logout}
      />
    );
  }

  if (user.role === 'me') {
    return <MeScreen user={user} sites={sites} onLogout={logout} />;
  }

  if (user.role === 'eo') {
    return (
      <EoScreen
        user={user}
        sites={sites}
        complaints={complaints}
        onAddComplaint={handleAddComplaint}
        onResolveComplaint={handleResolveComplaint}
        onLogout={logout}
      />
    );
  }

  return (
    <HqScreen
      user={user}
      sites={sites}
      onAddSite={handleAddSite}
      onLogout={logout}
    />
  );
}

