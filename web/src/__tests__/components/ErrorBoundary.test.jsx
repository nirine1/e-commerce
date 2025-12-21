import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

// Composant qui génère une erreur pour les tests
// const ThrowError = () => {
//     throw new Error('Test error')
// }

describe('ErrorBoundary Component', () => {
    // it('devrait afficher les enfants sans erreur', () => {
    //     // Render ErrorBoundary avec un composant enfant simple
    //     // Vérifier que l'enfant s'affiche correctement
    // })

    // it('devrait attraper une erreur et afficher le message d\'erreur', () => {
    //     // Supprimer les console.error pendant le test (mock)
    //     // Render ErrorBoundary avec ThrowError comme enfant
    //     // Vérifier que le message "Une erreur est survenue" s'affiche
    //     // Vérifier que le message d'erreur personnalisé s'affiche
    // })

    // it('devrait afficher le bouton "Réessayer"', () => {
    //     // Render ErrorBoundary avec ThrowError
    //     // Vérifier que le bouton "Réessayer" est présent
    // })

    // it('devrait réinitialiser l\'erreur quand on clique sur "Réessayer"', () => {
    //     // Render ErrorBoundary avec composant qui peut throw conditionnellement
    //     // Déclencher l'erreur
    //     // Cliquer sur "Réessayer"
    //     // Vérifier que l'enfant normal s'affiche à nouveau
    // })

    // it('devrait afficher "Erreur inconnue" si aucun message d\'erreur', () => {
    //     // Throw une erreur sans message
    //     // Vérifier que "Erreur inconnue" s'affiche
    // })

    // it('devrait logger l\'erreur dans la console', () => {
    //     // Mock console.error
    //     // Throw une erreur
    //     // Vérifier que console.error a été appelé
    // })
})
