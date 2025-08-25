import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminSignup from "../pages/Auth/admin/AdminSignup";
import AdminLogin from "../pages/Auth/admin/AdminLogin";
import AdminSignupCode from "../pages/Auth/admin/AdminSignupCode";
import ClientLogin from "../pages/Auth/client/ClientLogin";
import VerificationCodeClient from "../pages/Auth/client/VerificationCodeClient";
import TableDemo from "../pages/testPages/TableDemo";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";

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
			<Route path="/test/table" element={<TableDemo />} />
			{/* Admin Dashboard */}
			<Route path="/admin/dashboard" element={<AdminDashboard />} />
		</Routes>
	);
};

export default AppRoutes;
