import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';

const Onboarding      = lazy(() => import('./pages/Onboarding'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const ExerciseLibrary = lazy(() => import('./pages/ExerciseLibrary'));
const WorkoutPlayer   = lazy(() => import('./pages/WorkoutPlayer'));
const ProfileSwitcher = lazy(() => import('./pages/ProfileSwitcher'));

function App() {
  const { profiles, loading } = useApp();
  const location = useLocation();

  if (loading) return <LoadingScreen message="Loading your fitness data..." />;

  const isAddingNew = location.state?.addNew === true;
  const hasProfiles = profiles.length > 0;

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>

      <SignedIn>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={hasProfiles ? <Dashboard /> : <Navigate to="/onboarding" replace />} />
              <Route
                path="onboarding"
                element={hasProfiles && !isAddingNew ? <Navigate to="/" replace /> : <Onboarding />}
              />
              <Route path="exercises" element={<ExerciseLibrary />} />
              <Route path="profiles"  element={<ProfileSwitcher />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Route>
            <Route path="/workout" element={<WorkoutPlayer />} />
          </Routes>
        </Suspense>
      </SignedIn>
    </>
  );
}

export default App;
