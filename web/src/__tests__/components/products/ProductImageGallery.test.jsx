import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductImageGallery from '../../../components/products/ProductImageGallery'

const mockPrimaryImage = {
    id: 1,
    image_url: '/primary.jpg',
    alt_text: 'Image principale'
}

const mockProductImages = [
    { id: 1, image_url: '/primary.jpg', alt_text: 'Image principale' },
    { id: 2, image_url: '/image2.jpg', alt_text: 'Image secondaire' },
    { id: 3, image_url: '/image3.jpg', alt_text: 'Image tertiaire' }
]

describe('ProductImageGallery Component', () => {
    it('devrait afficher l\'image principale au chargement', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={mockProductImages}
            />
        )

        const mainImage = screen.getAllByAltText('Image principale')[0]
        expect(mainImage).toBeInTheDocument()
        expect(mainImage).toHaveAttribute('src', '/primary.jpg')
    })

    it('devrait afficher toutes les miniatures', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={mockProductImages}
            />
        )

        const thumbnails = screen.getAllByRole('button')
        expect(thumbnails).toHaveLength(mockProductImages.length)
    })

    it('devrait changer l\'image principale au clic sur une miniature', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={mockProductImages}
            />
        )

        const thumbnails = screen.getAllByRole('button')

        // Click on the second thumbnail
        fireEvent.click(thumbnails[1])

        // Check if main image changed
        const mainImage = screen.getAllByAltText('Image secondaire')[0]
        expect(mainImage).toHaveAttribute('src', '/image2.jpg')
    })

    it('devrait appliquer le style actif à la miniature sélectionnée', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={mockProductImages}
            />
        )

        const thumbnails = screen.getAllByRole('button')

        // First thumbnail should be active initially
        expect(thumbnails[0]).toHaveAttribute('aria-current', 'true')
        expect(thumbnails[0]).toHaveClass('ring-2', 'ring-black')

        // Click on second thumbnail
        fireEvent.click(thumbnails[1])

        // Second thumbnail should now be active
        expect(thumbnails[1]).toHaveAttribute('aria-current', 'true')
        expect(thumbnails[1]).toHaveClass('ring-2', 'ring-black')
    })

    it('devrait avoir des labels d\'accessibilité appropriés', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={mockProductImages}
            />
        )

        const thumbnails = screen.getAllByRole('button')

        expect(thumbnails[0]).toHaveAttribute('aria-label', 'Voir l\'image 1 sur 3 du produit')
        expect(thumbnails[1]).toHaveAttribute('aria-label', 'Voir l\'image 2 sur 3 du produit')
        expect(thumbnails[2]).toHaveAttribute('aria-label', 'Voir l\'image 3 sur 3 du produit')
    })

    it('ne devrait pas afficher la section des miniatures si le tableau est vide', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={[]}
            />
        )

        const thumbnails = screen.queryAllByRole('button')
        expect(thumbnails).toHaveLength(0)
    })

    it('devrait afficher l\'image principale même sans miniatures', () => {
        render(
            <ProductImageGallery
                primaryImage={mockPrimaryImage}
                productImages={[]}
            />
        )

        const mainImage = screen.getByAltText('Image principale')
        expect(mainImage).toBeInTheDocument()
        expect(mainImage).toHaveAttribute('src', '/primary.jpg')
    })

    it('devrait gérer les images sans texte alternatif', () => {
        const imagesWithoutAlt = [
            { id: 1, image_url: '/img1.jpg', alt_text: null },
            { id: 2, image_url: '/img2.jpg' }
        ]

        const primaryWithoutAlt = { id: 1, image_url: '/img1.jpg', alt_text: null }

        render(
            <ProductImageGallery
                primaryImage={primaryWithoutAlt}
                productImages={imagesWithoutAlt}
            />
        )

        const mainImage = screen.getAllByRole('img')[0]
        expect(mainImage).toBeInTheDocument()
    })
})
