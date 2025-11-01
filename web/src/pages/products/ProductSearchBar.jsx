import React, { useCallback, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react';

const ProductSearchBar = ({ onSearch }) => {
    const [searchValue, setSearchValue] = useState('');
    const debounceDelay = useRef(null);
    const handleKeyUp = useCallback((event) => {
        if(debounceDelay.current) {
            clearTimeout(debounceDelay.current);
        }

        debounceDelay.current = setTimeout(() => {
            onSearch(event.target.value);
        }, 300);
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

export default ProductSearchBar