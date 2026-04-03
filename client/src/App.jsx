import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Summary from './pages/Summary';
import Chart from './pages/Chart';
import Alerts from './pages/Alerts';
import Log from './pages/Log';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="home" element={<Home />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/signup" element={<Signup />} />
        <Route path="dashboard" element={
          <ProtectedRoute role="owner">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="summary" element={
          <ProtectedRoute role="owner">
            <Summary />
          </ProtectedRoute>
        } />
        <Route path="chart" element={
          <ProtectedRoute role="owner">
            <Chart />
          </ProtectedRoute>
        } />
        <Route path="alerts" element={
          <ProtectedRoute role="owner">
            <Alerts />
          </ProtectedRoute>
        } />
        <Route path="log" element={
          <ProtectedRoute>
             <Log />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
