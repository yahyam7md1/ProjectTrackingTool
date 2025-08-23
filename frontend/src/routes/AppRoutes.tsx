import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminSignup from "../pages/Auth/AdminSignup";

const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route element={<AuthLayout />}>
				<Route path="/admin/signup" element={<AdminSignup />} />
			</Route>
		</Routes>
	);
};

export default AppRoutes;
