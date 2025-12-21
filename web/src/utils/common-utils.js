export const buildFilterParams = (filters) => {
    // Retirer les valeurs vides ou false
    const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
    );

    // Traiter le tri 
    Object.entries(cleanedFilters).forEach(([key, value]) => {
        if (typeof value === 'string' && (value.includes('_asc') || value.includes('_desc'))) {
            cleanedFilters.sort_direction = value.includes('_asc') ? 'asc' : 'desc';
            cleanedFilters.sort_by = value.replace(/_asc|_desc/, '');
        }
    }); 

    return cleanedFilters;
};