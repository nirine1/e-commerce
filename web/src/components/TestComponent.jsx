import React from 'react'
import { useAuth } from '../contexts/auth';
import { Button } from "@/components/ui/button";

const TestComponent = () => {
    const { user, loading, logout } = useAuth();

    return (
        <>
            <div>
                <h1 className='mb-4'>Bonjour {user.email} !</h1>

                <Button onClick={() => logout()}>
                    Se déconnecter
                </Button>
            </div>
        </>
    )
}

export default TestComponent