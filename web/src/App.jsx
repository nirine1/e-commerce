import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import ForgotPassword from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';
import TestComponent from './components/test-component';
import { AuthProvider } from './contexts/auth';
import RouteLayout from './components/route-layout';
import ProductIndex from './pages/products/ProductIndex';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route element={<RouteLayout isProtected={false} />}>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    <Route element={<RouteLayout isProtected={true} />}>
                        <Route path="/" element={<TestComponent />} />
                        <Route path="/products" element={<ProductIndex />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;