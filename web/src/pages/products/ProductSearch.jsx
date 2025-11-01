import React, { useCallback, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react';

const ProductSearch = ({ onSearch }) => {
    const [searchValue, setSearchValue] = useState('');
    const handleKeyUp = useCallback((event) => {
        onSearch(event.target.value);
    }, [onSearch]);

    return (
        <div className="flex justify-end">
            <div className='w-[50%] flex items-center gap-4'>
                <Input 
                    type="q" 
                    placeholder="Barre de recherche" 
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                />
                <Search/>
            </div>
        </div>
    )
}

export default ProductSearch