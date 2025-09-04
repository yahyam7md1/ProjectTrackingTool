import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminSignup from "../pages/Auth/admin/AdminSignup";
import AdminLogin from "../pages/Auth/admin/AdminLogin";
import AdminSignupCode from "../pages/Auth/admin/AdminSignupCode";
import ClientLogin from "../pages/Auth/client/ClientLogin";
import VerificationCodeClient from "../pages/Auth/client/VerificationCodeClient";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";
import ManageProjectPage from "../pages/dashboards/admin/ManageProjectPage";
import NoActiveProjectsPage from "../pages/dashboards/client/NoActiveProjectsPage";
import ClientMultiProjectDashboard from "../pages/dashboards/client/ClientMultiProjectDashboard";
import ClientManageProjectPage from "../pages/dashboards/client/ClientManageProjectPage";
import { ProjectsProvider } from "../context/ProjectsContext";

const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route element={<AuthLayout />}>
				<Route path="/admin/signup" element={<AdminSignup />} />
				<Route path="/admin/login" element={<AdminLogin />} />
				<Route path="/admin/verify" element={<AdminSignupCode />} />
				<Route path="/client/login" element={<ClientLogin />} />
				<Route path="/client/verify" element={<VerificationCodeClient />} />
			</Route>
			{/* Test route for Table component demo */}
			
			{/* Admin Dashboard */}
			<Route path="/admin/dashboard" element={
				<ProjectsProvider>
					<AdminDashboard />
				</ProjectsProvider>
			} />
			{/* Project Management */}
			<Route path="/admin/projects/:projectId?" element={
				<ProjectsProvider>
					<ManageProjectPage />
				</ProjectsProvider>
			} />
			
			{/* Client Routes */}
			<Route path="/client/no-projects" element={<NoActiveProjectsPage />} />
			<Route path="/client/dashboard" element={
				<ProjectsProvider>
					<ClientMultiProjectDashboard />
				</ProjectsProvider>
			} />
			{/* Individual project view for clients */}
			<Route path="/client/projects/:projectId" element={
				<ProjectsProvider>
					<ClientManageProjectPage />
				</ProjectsProvider>
			} />
		</Routes>
	);
};

export default AppRoutes;
