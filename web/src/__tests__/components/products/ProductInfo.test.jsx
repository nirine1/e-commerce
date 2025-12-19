import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductInfo from '../../../components/products/ProductInfo'

const mockCategories = [
    { id: 1, name: 'Électronique' },
    { id: 2, name: 'Ordinateurs' }
]

const mockProductInfo = {
    name: 'MacBook Pro',
    sku: 'MBP-2024-001',
    categories: mockCategories,
    shortDescription: 'Un ordinateur portable puissant',
    price: 1999.99,
    comparePrice: 2499.99,
    inStock: true,
    quantity: 5
}

describe('ProductInfo Component', () => {
    it('devrait afficher le nom du produit', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
        expect(screen.getByText('MacBook Pro').tagName).toBe('H1')
    })

    it('devrait afficher le SKU', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText(/SKU: MBP-2024-001/)).toBeInTheDocument()
    })

    it('devrait afficher toutes les catégories', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText('Électronique')).toBeInTheDocument()
        expect(screen.getByText('Ordinateurs')).toBeInTheDocument()
    })

    it('ne devrait pas afficher la section des catégories si vide', () => {
        render(<ProductInfo {...mockProductInfo} categories={[]} />)

        expect(screen.queryByText('Électronique')).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher la section des catégories si null', () => {
        render(<ProductInfo {...mockProductInfo} categories={null} />)

        expect(screen.queryByText('Électronique')).not.toBeInTheDocument()
    })

    it('devrait afficher la description courte', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText('Un ordinateur portable puissant')).toBeInTheDocument()
    })

    it('ne devrait pas afficher la description courte si absente', () => {
        render(<ProductInfo {...mockProductInfo} shortDescription={null} />)

        expect(screen.queryByText('Un ordinateur portable puissant')).not.toBeInTheDocument()
    })

    it('devrait formater le prix en euros', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText(/1 999,99 €/)).toBeInTheDocument()
    })

    it('devrait afficher le prix comparatif barré si supérieur au prix', () => {
        render(<ProductInfo {...mockProductInfo} />)

        const comparePrice = screen.getByText(/2 499,99 €/)
        expect(comparePrice).toBeInTheDocument()
        expect(comparePrice).toHaveClass('line-through')
    })

    it('ne devrait pas afficher le prix comparatif si null', () => {
        render(<ProductInfo {...mockProductInfo} comparePrice={null} />)

        expect(screen.queryByText(/2 499,99 €/)).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher le prix comparatif si inférieur au prix', () => {
        render(<ProductInfo {...mockProductInfo} comparePrice={1500} />)

        expect(screen.queryByText(/1 500,00 €/)).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher le prix comparatif si égal au prix', () => {
        render(<ProductInfo {...mockProductInfo} comparePrice={1999.99} />)

        // Should only see one price
        const prices = screen.getAllByText(/1 999,99 €/)
        expect(prices).toHaveLength(1)
    })

    it('devrait afficher "En stock" avec la quantité disponible', () => {
        render(<ProductInfo {...mockProductInfo} />)

        expect(screen.getByText(/En stock \(5 disponibles\)/)).toBeInTheDocument()
    })

    it('devrait afficher "disponible" au singulier pour quantité = 1', () => {
        render(<ProductInfo {...mockProductInfo} quantity={1} />)

        expect(screen.getByText(/En stock \(1 disponible\)/)).toBeInTheDocument()
    })

    it('devrait afficher "disponibles" au pluriel pour quantité > 1', () => {
        render(<ProductInfo {...mockProductInfo} quantity={10} />)

        expect(screen.getByText(/En stock \(10 disponibles\)/)).toBeInTheDocument()
    })

    it('devrait afficher "Rupture de stock" si pas en stock', () => {
        render(<ProductInfo {...mockProductInfo} inStock={false} />)

        expect(screen.getByText('Rupture de stock')).toBeInTheDocument()
    })

    it('devrait avoir un badge vert pour produit en stock', () => {
        render(<ProductInfo {...mockProductInfo} />)

        const badge = screen.getByText(/En stock/)
        expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('devrait avoir un badge rouge pour produit en rupture', () => {
        render(<ProductInfo {...mockProductInfo} inStock={false} />)

        const badge = screen.getByText('Rupture de stock')
        expect(badge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('devrait afficher le bouton "Ajouter au panier" si en stock', () => {
        render(<ProductInfo {...mockProductInfo} />)

        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Ajouter au panier')
        expect(button).not.toBeDisabled()
    })

    it('devrait afficher le bouton "Indisponible" désactivé si pas en stock', () => {
        render(<ProductInfo {...mockProductInfo} inStock={false} />)

        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Indisponible')
        expect(button).toBeDisabled()
    })

    it('devrait gérer les prix avec des décimales', () => {
        render(<ProductInfo {...mockProductInfo} price={99.5} />)

        expect(screen.getByText(/99,50 €/)).toBeInTheDocument()
    })

    it('devrait gérer les prix ronds sans décimales', () => {
        render(<ProductInfo {...mockProductInfo} price={100} />)

        expect(screen.getByText(/100,00 €/)).toBeInTheDocument()
    })
})
