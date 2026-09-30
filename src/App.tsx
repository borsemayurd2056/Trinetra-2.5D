import React from 'react';
import { PerceptionProvider } from './context/PerceptionContext';
import { AppShell } from './components/layout/AppShell';

export function App() {
  return (
    <PerceptionProvider>
      <AppShell />
    </PerceptionProvider>
  );
}

export default App;
