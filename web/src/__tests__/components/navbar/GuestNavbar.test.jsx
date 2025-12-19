import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import GuestNavbar from '../../../components/navbar/GuestNavbar'

// Mock du contexte auth
// vi.mock('../../../contexts/auth', () => ({
//     useAuth: vi.fn()
// }))

// const renderWithRouter = (component) => {
//     return render(
//         <BrowserRouter>
//             {component}
//         </BrowserRouter>
//     )
// }

describe('GuestNavbar Component', () => {
    // it('devrait afficher le logo "E-commerce"', () => {
    //     // Mock useAuth
    //     // Render GuestNavbar avec Router
    //     // Vérifier que "E-commerce" s'affiche
    // })

    // it('devrait afficher le lien vers les produits', () => {
    //     // Mock useAuth
    //     // Render GuestNavbar
    //     // Vérifier que le lien "Produits" est présent
    // })

    // it('devrait appliquer le style actif au lien "Produits" quand on est sur /products', () => {
    //     // Mock useAuth
    //     // Render GuestNavbar avec initialEntries=['/products']
    //     // Vérifier que le lien a les classes "text-blue-600 font-semibold"
    // })

    // it('ne devrait pas afficher de bouton de déconnexion', () => {
    //     // Mock useAuth
    //     // Render GuestNavbar
    //     // Vérifier qu'il n'y a pas de bouton "Se déconnecter"
    // })

    // it('ne devrait pas afficher l\'email de l\'utilisateur', () => {
    //     // Mock useAuth avec un user
    //     // Render GuestNavbar
    //     // Vérifier que l'email ne s'affiche pas (c'est une navbar guest)
    // })
})
