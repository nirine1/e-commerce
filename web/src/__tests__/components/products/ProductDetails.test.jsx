import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductDetails from '../../../components/products/ProductDetails'

const mockCategories = [
    { id: 1, name: 'Électronique' },
    { id: 2, name: 'Ordinateurs' }
]

const mockProductDetails = {
    categories: mockCategories,
    description: 'Un ordinateur portable haute performance avec processeur M3 et écran Retina.',
    dimensions: {
        length: 30.5,
        width: 21.5,
        height: 1.6
    },
    weight: 1.4,
    inStock: true,
    sku: 'MBP-2024-001'
}

describe('ProductDetails Component', () => {
    it('devrait afficher le titre de la section', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Détails du produit')).toBeInTheDocument()
    })

    it('devrait afficher la description du produit', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText(/Un ordinateur portable haute performance/)).toBeInTheDocument()
    })

    it('ne devrait pas afficher la section description si absente', () => {
        render(<ProductDetails {...mockProductDetails} description={null} />)

        expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('devrait afficher le titre "Spécifications" quand il y a des dimensions', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Spécifications')).toBeInTheDocument()
    })

    it('devrait afficher le titre "Spécifications" quand il y a un poids', () => {
        render(<ProductDetails {...mockProductDetails} dimensions={null} />)

        expect(screen.getByText('Spécifications')).toBeInTheDocument()
    })

    it('ne devrait pas afficher "Spécifications" sans dimensions ni poids', () => {
        render(<ProductDetails {...mockProductDetails} dimensions={null} weight={null} />)

        expect(screen.queryByText('Spécifications')).not.toBeInTheDocument()
    })

    it('devrait afficher le poids', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Poids')).toBeInTheDocument()
        expect(screen.getByText('1.4 kg')).toBeInTheDocument()
    })

    it('ne devrait pas afficher le poids si absent', () => {
        render(<ProductDetails {...mockProductDetails} weight={null} />)

        expect(screen.queryByText('Poids')).not.toBeInTheDocument()
    })

    it('devrait afficher la longueur', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Longueur')).toBeInTheDocument()
        expect(screen.getByText('30.5 cm')).toBeInTheDocument()
    })

    it('devrait afficher la largeur', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Largeur')).toBeInTheDocument()
        expect(screen.getByText('21.5 cm')).toBeInTheDocument()
    })

    it('devrait afficher la hauteur', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Hauteur')).toBeInTheDocument()
        expect(screen.getByText('1.6 cm')).toBeInTheDocument()
    })

    it('ne devrait pas afficher la longueur si absente', () => {
        const dimensionsWithoutLength = { width: 21.5, height: 1.6 }
        render(<ProductDetails {...mockProductDetails} dimensions={dimensionsWithoutLength} />)

        expect(screen.queryByText('Longueur')).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher la largeur si absente', () => {
        const dimensionsWithoutWidth = { length: 30.5, height: 1.6 }
        render(<ProductDetails {...mockProductDetails} dimensions={dimensionsWithoutWidth} />)

        expect(screen.queryByText('Largeur')).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher la hauteur si absente', () => {
        const dimensionsWithoutHeight = { length: 30.5, width: 21.5 }
        render(<ProductDetails {...mockProductDetails} dimensions={dimensionsWithoutHeight} />)

        expect(screen.queryByText('Hauteur')).not.toBeInTheDocument()
    })

    it('devrait gérer un objet dimensions vide', () => {
        render(<ProductDetails {...mockProductDetails} dimensions={{}} weight={null} />)

        expect(screen.queryByText('Spécifications')).not.toBeInTheDocument()
    })

    it('devrait afficher le SKU dans la section Informations', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('SKU:')).toBeInTheDocument()
        expect(screen.getByText('MBP-2024-001')).toBeInTheDocument()
    })

    it('devrait afficher "En stock" si inStock est true', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Disponibilité:')).toBeInTheDocument()
        expect(screen.getByText('En stock')).toBeInTheDocument()
    })

    it('devrait afficher "Rupture de stock" si inStock est false', () => {
        render(<ProductDetails {...mockProductDetails} inStock={false} />)

        expect(screen.getByText('Disponibilité:')).toBeInTheDocument()
        expect(screen.getByText('Rupture de stock')).toBeInTheDocument()
    })

    it('devrait afficher les catégories séparées par des virgules', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Catégories:')).toBeInTheDocument()
        expect(screen.getByText('Électronique, Ordinateurs')).toBeInTheDocument()
    })

    it('ne devrait pas afficher la ligne catégories si le tableau est vide', () => {
        render(<ProductDetails {...mockProductDetails} categories={[]} />)

        expect(screen.queryByText('Catégories:')).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher la ligne catégories si null', () => {
        render(<ProductDetails {...mockProductDetails} categories={null} />)

        expect(screen.queryByText('Catégories:')).not.toBeInTheDocument()
    })

    it('devrait afficher la section Informations', () => {
        render(<ProductDetails {...mockProductDetails} />)

        expect(screen.getByText('Informations')).toBeInTheDocument()
    })

    it('devrait gérer une seule catégorie', () => {
        const singleCategory = [{ id: 1, name: 'Électronique' }]
        render(<ProductDetails {...mockProductDetails} categories={singleCategory} />)

        expect(screen.getByText('Électronique')).toBeInTheDocument()
        expect(screen.queryByText(',')).not.toBeInTheDocument()
    })

    it('devrait gérer trois catégories ou plus', () => {
        const multipleCategories = [
            { id: 1, name: 'Électronique' },
            { id: 2, name: 'Ordinateurs' },
            { id: 3, name: 'Apple' }
        ]
        render(<ProductDetails {...mockProductDetails} categories={multipleCategories} />)

        expect(screen.getByText('Électronique, Ordinateurs, Apple')).toBeInTheDocument()
    })

    it('devrait préserver les sauts de ligne dans la description', () => {
        const descriptionWithLineBreaks = 'Ligne 1\nLigne 2\nLigne 3'
        render(<ProductDetails {...mockProductDetails} description={descriptionWithLineBreaks} />)

        const description = screen.getByText(/Ligne 1/)
        expect(description).toHaveClass('whitespace-pre-line')
    })

    it('devrait afficher dimensions partielles correctement', () => {
        const partialDimensions = { length: 30.5 }
        render(<ProductDetails {...mockProductDetails} dimensions={partialDimensions} />)

        expect(screen.getByText('Spécifications')).toBeInTheDocument()
        expect(screen.getByText('30.5 cm')).toBeInTheDocument()
        expect(screen.queryByText('Largeur')).not.toBeInTheDocument()
        expect(screen.queryByText('Hauteur')).not.toBeInTheDocument()
    })
})
