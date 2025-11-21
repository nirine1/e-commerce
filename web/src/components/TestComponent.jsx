import React from 'react'
import { useAuth } from '../contexts/auth';
import { Link } from 'lucide-react';

const TestComponent = () => {
    const { user, loading, logout } = useAuth();

    return (
        <>
            <div>
                <h1>Bonjour {user.email} !</h1>
                <button 
                    onClick={() => logout()}
                >Se déconnecter</button>
                <span className='bg-red-500 cursor-pointer'>
                    <Link to="/products">Voir les produits</Link>
                </span>
            </div>
        </>
    )
}

export default TestComponent