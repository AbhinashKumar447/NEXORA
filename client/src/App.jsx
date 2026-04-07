import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';

import Dashboard from './features/dashboard/Dashboard.jsx';
import Login from './features/auth/Login.jsx';
import Signup from './features/auth/Signup.jsx';
import Profile from './features/profile/Profile.jsx';
import EditProfile from './features/profile/EditProfile.jsx';
import OpportunityList from './features/opportunity/OpportunityList.jsx';
import CreateOpportunity from './features/opportunity/CreateOpportunity.jsx';
import SearchPage from './features/search/SearchPage.jsx';
import StudyHelpPage from './features/studyHelp/StudyHelpPage.jsx';

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<PrivateRoute>
								<Profile />
							</PrivateRoute>
						}
					/>
					<Route
						path="/profile/edit"
						element={
							<PrivateRoute>
								<EditProfile />
							</PrivateRoute>
						}
					/>
					<Route
						path="/opportunities"
						element={
							<PrivateRoute>
								<OpportunityList />
							</PrivateRoute>
						}
					/>
					<Route
						path="/opportunities/new"
						element={
							<PrivateRoute>
								<CreateOpportunity />
							</PrivateRoute>
						}
					/>
					<Route
						path="/find"
						element={
							<PrivateRoute>
								<SearchPage />
							</PrivateRoute>
						}
					/>
					<Route
						path="/study-help"
						element={
							<PrivateRoute>
								<StudyHelpPage />
							</PrivateRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
