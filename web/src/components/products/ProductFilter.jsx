import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Filter, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const validationSchema = Yup.object({
    min_price: Yup.number()
        .min(0, 'Prix min positif')
        .nullable(),
    max_price: Yup.number()
        .min(0, 'Prix max positif')
        .when('min_price', (min_price, schema) => {
            return min_price
                ? schema.min(min_price, 'Max > Min')
                : schema
        })
        .nullable(),
})

const ProductFilter = ({ onFilter }) => {
    const formik = useFormik({
        initialValues: {
            is_featured: false,
            in_stock: false,
            min_price: '',
            max_price: '',
            sort_by: ''
        },
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            setSubmitting(true); 
            onFilter(values);
            setSubmitting(false);
        },
    })

    return (
        <div className="w-full bg-white border rounded-lg shadow-sm">
            <form onSubmit={formik.handleSubmit}>
                <div className="p-4 flex flex-wrap items-center gap-4">
                    {/* Checkboxes */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_featured"
                            checked={formik.values.is_featured}
                            onCheckedChange={(checked) =>
                                formik.setFieldValue('is_featured', checked)
                            }
                        />
                        <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                            En vedette
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="in_stock"
                            checked={formik.values.in_stock}
                            onCheckedChange={(checked) =>
                                formik.setFieldValue('in_stock', checked)
                            }
                        />
                        <Label htmlFor="in_stock" className="text-sm font-medium cursor-pointer">
                            En stock
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Prix:</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                id="min_price"
                                name="min_price"
                                placeholder="Min"
                                value={formik.values.min_price}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-24 h-9 ${formik.touched.min_price && formik.errors.min_price ? 'border-red-500' : ''}`}
                            />
                            {formik.touched.min_price && formik.errors.min_price && (
                                <p className="absolute text-xs text-red-500 mt-0.5 whitespace-nowrap">{formik.errors.min_price}</p>
                            )}
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="relative">
                            <Input
                                type="number"
                                id="max_price"
                                name="max_price"
                                placeholder="Max"
                                value={formik.values.max_price}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-24 h-9 ${formik.touched.max_price && formik.errors.max_price ? 'border-red-500' : ''}`}
                            />
                            {formik.touched.max_price && formik.errors.max_price && (
                                <p className="absolute text-xs text-red-500 mt-0.5 whitespace-nowrap">{formik.errors.max_price}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="sort_by" className="text-sm font-medium whitespace-nowrap">
                            Trier:
                        </Label>
                        <Select
                            value={formik.values.sort_by}
                            onValueChange={(value) => formik.setFieldValue('sort_by', value)}
                        >
                            <SelectTrigger id="sort_by" className="w-48 h-9">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price_asc">Prix ↑</SelectItem>
                                <SelectItem value="price_desc">Prix ↓</SelectItem>
                                <SelectItem value="quantity_asc">Quantité ↑</SelectItem>
                                <SelectItem value="quantity_desc">Quantité ↓</SelectItem>
                                <SelectItem value="name_asc">Nom A-Z</SelectItem>
                                <SelectItem value="name_desc">Nom Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 ml-auto">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => formik.resetForm()}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Réinitialiser
                        </Button>
                        <Button type="submit" size="sm" disabled={formik.isSubmitting}>
                            <Check className="w-4 h-4 mr-1" />
                            {formik.isSubmitting ? 'Application...' : 'Appliquer'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ProductFilter