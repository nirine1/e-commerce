import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'

// Mock du contexte auth
// vi.mock('../../contexts/auth', () => ({
//     useAuth: vi.fn()
// }))

// const renderWithRouter = (component, initialRoute = '/') => {
//     return render(
//         <BrowserRouter>
//             <Routes>
//                 <Route path="*" element={component} />
//             </Routes>
//         </BrowserRouter>
//     )
// }

describe('MainLayout Component', () => {
    // describe('État de chargement', () => {
    //     // it('devrait afficher le message de chargement pendant la vérification d\'auth', () => {
    //     //     // Mock useAuth avec loading=true
    //     //     // Render MainLayout
    //     //     // Vérifier que "Vérification de l'authentification..." s'affiche
    //     // })
    // })

    // describe('Protection des routes (isProtected=true)', () => {
    //     // it('devrait rediriger vers /login si utilisateur non connecté', () => {
    //     //     // Mock useAuth avec user=null, loading=false
    //     //     // Render MainLayout avec isProtected={true}
    //     //     // Vérifier la redirection vers /login
    //     // })

    //     // it('devrait afficher le layout si utilisateur connecté', () => {
    //     //     // Mock useAuth avec user, loading=false
    //     //     // Render MainLayout avec isProtected={true}
    //     //     // Vérifier que le MainNavbar s'affiche
    //     //     // Vérifier que le footer s'affiche
    //     // })
    // })

    // describe('Routes d\'authentification (isAuth=true)', () => {
    //     // it('devrait rediriger vers / si utilisateur déjà connecté', () => {
    //     //     // Mock useAuth avec user, loading=false
    //     //     // Render MainLayout avec isAuth={true}
    //     //     // Vérifier la redirection vers /
    //     // })

    //     // it('devrait afficher le layout si utilisateur non connecté', () => {
    //     //     // Mock useAuth avec user=null, loading=false
    //     //     // Render MainLayout avec isAuth={true}
    //     //     // Vérifier que le layout s'affiche
    //     // })
    // })

    // describe('Layout public (isProtected=false, isAuth=false)', () => {
    //     // it('devrait afficher le layout pour tout le monde', () => {
    //     //     // Mock useAuth
    //     //     // Render MainLayout avec isProtected={false}, isAuth={false}
    //     //     // Vérifier que le layout s'affiche
    //     // })
    // })

    // describe('Éléments du layout', () => {
    //     // it('devrait afficher la navbar', () => {
    //     //     // Mock useAuth
    //     //     // Render MainLayout
    //     //     // Vérifier que MainNavbar est présent
    //     // })

    //     // it('devrait afficher le footer avec le copyright', () => {
    //     //     // Mock useAuth
    //     //     // Render MainLayout
    //     //     // Vérifier que "© 2025 E-commerce. Tous droits réservés." s'affiche
    //     // })

    //     // it('devrait afficher le contenu via Outlet', () => {
    //     //     // Mock useAuth
    //     //     // Render MainLayout avec un enfant dans Routes
    //     //     // Vérifier que l'enfant s'affiche dans le <main>
    //     // })
    // })
})
