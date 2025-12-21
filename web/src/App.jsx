import './App.css';
import { AuthProvider } from './contexts/auth';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;