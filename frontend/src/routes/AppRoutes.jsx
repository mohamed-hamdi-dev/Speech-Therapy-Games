import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import CreateGame from '../pages/admin/CreateGame';
import EditGame from '../pages/admin/EditGame';
import GamesManager from '../pages/admin/GamesManager';
import ReportsPage from '../pages/admin/ReportsPage';
import StudentForm from '../pages/admin/StudentForm';
import StudentProfile from '../pages/admin/StudentProfile';
import StudentsList from '../pages/admin/StudentsList';

import GamePlay from '../pages/student/GamePlay';
import Result from '../pages/student/Result';
import StudentHome from '../pages/student/StudentHome';
import StudentLogin from '../pages/student/StudentLogin';

const hasAdminSession = () => Boolean(localStorage.getItem('therapy_admin_session'));

const AdminEntry = () => (
  <Navigate to={hasAdminSession() ? '/admin/dashboard' : '/admin/login'} replace />
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />

      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/home" replace />} />
        <Route path="login" element={<StudentLogin />} />
        <Route path="home" element={<StudentHome />} />
        <Route path="game/:gameId" element={<GamePlay />} />
        <Route path="result" element={<Result />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminEntry />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="games" element={<GamesManager />} />
        <Route path="games/create" element={<CreateGame />} />
        <Route path="games/edit/:gameId" element={<EditGame />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="students/create" element={<StudentForm mode="create" />} />
        <Route path="students/edit/:studentId" element={<StudentForm mode="edit" />} />
        <Route path="students/:studentId" element={<StudentProfile />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/student/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
