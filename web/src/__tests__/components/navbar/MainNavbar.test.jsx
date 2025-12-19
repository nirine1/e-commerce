import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MainNavbar from '../../../components/navbar/MainNavbar'

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

describe('MainNavbar Component', () => {
    // describe('Sans utilisateur connecté', () => {
    //     // it('devrait afficher le logo "E-commerce"', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render MainNavbar
    //     //     // Vérifier que "E-commerce" s'affiche
    //     // })

    //     // it('devrait afficher le lien "Produits"', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Produits" s'affiche
    //     // })

    //     // it('ne devrait pas afficher le lien "Accueil"', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Accueil" ne s'affiche pas
    //     // })

    //     // it('ne devrait pas afficher l\'email de l\'utilisateur', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render MainNavbar
    //     //     // Vérifier qu'aucun email ne s'affiche
    //     // })

    //     // it('ne devrait pas afficher le bouton de déconnexion', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Se déconnecter" ne s'affiche pas
    //     // })
    // })

    // describe('Avec utilisateur connecté', () => {
    //     // it('devrait afficher le lien "Accueil"', () => {
    //     //     // Mock useAuth avec user
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Accueil" s'affiche
    //     // })

    //     // it('devrait afficher l\'email de l\'utilisateur', () => {
    //     //     // Mock useAuth avec user
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Bonjour, {email}" s'affiche
    //     // })

    //     // it('devrait afficher le bouton de déconnexion', () => {
    //     //     // Mock useAuth avec user
    //     //     // Render MainNavbar
    //     //     // Vérifier que "Se déconnecter" s'affiche
    //     // })

    //     // it('devrait appeler logout quand on clique sur le bouton de déconnexion', () => {
    //     //     // Mock useAuth avec user et logout
    //     //     // Render MainNavbar
    //     //     // Cliquer sur "Se déconnecter"
    //     //     // Vérifier que logout a été appelé
    //     // })
    // })

    // describe('Navigation active', () => {
    //     // it('devrait appliquer le style actif au lien "Accueil" sur /', () => {
    //     //     // Mock useAuth avec user
    //     //     // Render MainNavbar avec initialEntries=['/']
    //     //     // Vérifier que "Accueil" a les classes actives
    //     // })

    //     // it('devrait appliquer le style actif au lien "Produits" sur /products', () => {
    //     //     // Mock useAuth
    //     //     // Render MainNavbar avec initialEntries=['/products']
    //     //     // Vérifier que "Produits" a les classes actives
    //     // })
    // })
})
