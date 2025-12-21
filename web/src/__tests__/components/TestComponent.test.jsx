import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TestComponent from '../../components/TestComponent'

// Mock du contexte auth
// vi.mock('../../contexts/auth', () => ({
//     useAuth: vi.fn()
// }))

// const renderWithRouter = (component) => {
//     return render(
//         <BrowserRouter>
//             {component}
//         </BrowserRouter>
//     )
// }

describe('TestComponent', () => {
    // it('devrait afficher le message de bienvenue avec l\'email de l\'utilisateur', () => {
    //     // Mock useAuth pour retourner un user
    //     // Render TestComponent
    //     // Vérifier que "Bonjour {email}!" s'affiche
    // })

    // it('devrait afficher le bouton de déconnexion', () => {
    //     // Mock useAuth
    //     // Render TestComponent
    //     // Vérifier que le bouton "Se déconnecter" est présent
    // })

    // it('devrait appeler logout quand on clique sur "Se déconnecter"', () => {
    //     // Mock useAuth avec logout
    //     // Render TestComponent
    //     // Cliquer sur "Se déconnecter"
    //     // Vérifier que logout a été appelé
    // })

    // it('devrait afficher le lien vers les produits', () => {
    //     // Mock useAuth
    //     // Render TestComponent avec Router
    //     // Vérifier que le lien "Voir les produits" est présent
    // })
})
