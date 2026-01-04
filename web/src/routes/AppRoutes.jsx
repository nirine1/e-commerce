import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import TestComponent from '../components/TestComponent';
import ProductIndex from '../pages/products/ProductIndex';
import ProductShow from '../pages/products/ProductShow';
import ShoppingCart from '../pages/cart/ShoppingCart';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout isAuth={true} />}>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route element={<MainLayout isProtected={false} isAuth={false}/>}>
                    <Route path="/products" element={<ProductIndex />} />
                    <Route path="/products/:slug" element={<ProductShow />} />

                    <Route path="/cart" element={<ShoppingCart />} />
                </Route>

                <Route element={<MainLayout isProtected={true} />}>
                    <Route path="/" element={<TestComponent />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
