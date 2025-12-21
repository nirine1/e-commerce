import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from '../../components/FormField'

// Mock Formik pour les tests
// const mockFormik = {
//     values: {},
//     errors: {},
//     touched: {},
//     isSubmitting: false,
//     getFieldProps: (name) => ({
//         name,
//         value: mockFormik.values[name] || '',
//         onChange: vi.fn(),
//         onBlur: vi.fn()
//     })
// }

describe('FormField Component', () => {
    // it('devrait afficher le label si fourni', () => {
    //     // Render FormField avec un label
    //     // Vérifier que le label s'affiche
    // })

    // it('ne devrait pas afficher de label si non fourni', () => {
    //     // Render FormField sans label
    //     // Vérifier qu'aucun label ne s'affiche
    // })

    // it('devrait afficher l\'input avec le type correct', () => {
    //     // Render FormField avec type="email"
    //     // Vérifier que l'input a le type "email"
    // })

    // it('devrait utiliser type="text" par défaut', () => {
    //     // Render FormField sans spécifier de type
    //     // Vérifier que l'input a le type "text"
    // })

    // it('devrait afficher le placeholder', () => {
    //     // Render FormField avec un placeholder
    //     // Vérifier que le placeholder s'affiche
    // })

    // it('devrait afficher le message d\'erreur si le champ a une erreur et a été touché', () => {
    //     // Créer un mock formik avec errors et touched
    //     // Render FormField
    //     // Vérifier que le message d'erreur s'affiche
    // })

    // it('ne devrait pas afficher le message d\'erreur si le champ n\'a pas été touché', () => {
    //     // Créer un mock formik avec errors mais sans touched
    //     // Render FormField
    //     // Vérifier que le message d'erreur ne s'affiche pas
    // })

    // it('devrait appliquer la classe d\'erreur border-red-500 quand il y a une erreur', () => {
    //     // Créer un mock formik avec erreur
    //     // Render FormField
    //     // Vérifier que l'input a la classe "border-red-500"
    // })

    // it('devrait désactiver l\'input pendant la soumission', () => {
    //     // Créer un mock formik avec isSubmitting=true
    //     // Render FormField
    //     // Vérifier que l'input est disabled
    // })

    // it('devrait connecter le label à l\'input via htmlFor/id', () => {
    //     // Render FormField avec label et name
    //     // Vérifier que le label a htmlFor={name}
    //     // Vérifier que l'input a id={name}
    // })

    // it('devrait passer les props supplémentaires à l\'input', () => {
    //     // Render FormField avec des props custom (ex: autoComplete)
    //     // Vérifier que l'input reçoit ces props
    // })
})
