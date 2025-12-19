import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductCard from '../../../components/products/ProductCard'

const mockProduct = {
    name: 'Test Product',
    price: 99.99,
    quantity: 10,
    images: [{ image_url: '/test.jpg' }, { image_url: '/test2.jpg' }],
    is_featured: true,
    short_description: 'A test description'
}

describe('ProductCard Component', () => {
    it('devrait afficher la carte produit', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    })

    it('devrait afficher la première image du produit', () => {
        render(<ProductCard product={mockProduct} />)

        const image = screen.getByAltText(mockProduct.name)
        expect(image).toHaveAttribute('src', '/test.jpg')
    })

    it('devrait afficher une image par défaut en cas de produit sans image', () => {
        const productWithoutImage = {
            ...mockProduct,
            images: []
        }

        render(<ProductCard product={productWithoutImage} />)

        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://www.basketpack.fr/wp-content/uploads/2022/04/comparatif-chaussures-basketball-peak-800x800-c-center.jpg')
    })

    it('devrait utiliser le nom du produit comme texte alternatif', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByRole('img')).toHaveAttribute('alt', mockProduct.name)
    })

    it('devrait afficher le badge si le produit est mis en avant', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByText(/Featured/)).toBeInTheDocument()
    })

    it('devrait cacher le badge si le produit n\'est pas mis en avant', () => {
        const notFeaturedProduct = {
            ...mockProduct,
            is_featured: false
        }

        render(<ProductCard product={notFeaturedProduct} />)

        expect(screen.queryByText('Featured')).not.toBeInTheDocument()
    })

    it('devrait afficher la description si disponible', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByText(mockProduct.short_description)).toBeInTheDocument()
    })

    it('ne devrait pas afficher la description si indisponible', () => {
        const productWithoutDescription = {
            ...mockProduct,
            short_description: undefined
        }
        render(<ProductCard product={productWithoutDescription} />)

        expect(screen.queryByText(mockProduct.short_description)).not.toBeInTheDocument()
    })

    it('devrait afficher le prix du produit', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByText(mockProduct.price.toFixed(2))).toBeInTheDocument()
    })

    it('devrait formatter le prix avec deux décimales', () => {
        const productWithPrice = {
            ...mockProduct,
            price: 99.5
        }

        render(<ProductCard product={productWithPrice} />)

        expect(screen.getByText('99.50')).toBeInTheDocument()
    })

    it('devrait afficher la quantité du produit en stock', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.queryByText(`${mockProduct.quantity} en stock`)).toBeInTheDocument()
    })

    it('devrait afficher 0 en stock', () => {
        const productOutOfStock = {
            ...mockProduct,
            quantity: 0
        }

        render(<ProductCard product={productOutOfStock} />)

        expect(screen.getByText('0 en stock')).toBeInTheDocument()
    })

    it('devrait afficher le bouton pour ajouter le produit dans le panier', () => {
        render(<ProductCard product={mockProduct} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText('Ajouter dans le panier')).toBeInTheDocument()
    })
})