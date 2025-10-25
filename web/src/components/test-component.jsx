import React from 'react'
import { useAuth } from '../contexts/auth';

const TestComponent = () => {
    const { user, loading, logout } = useAuth();

    return (
        <>
            <h1>Bonjour {user.email} !</h1>
            <button 
                onClick={() => logout()}
            >Se déconnecter</button>
        </>
    )
}

export default TestComponent