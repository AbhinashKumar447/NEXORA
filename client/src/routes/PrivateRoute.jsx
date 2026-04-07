import React from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function PrivateRoute({ children }) {
	return <ProtectedRoute>{children}</ProtectedRoute>;
}
