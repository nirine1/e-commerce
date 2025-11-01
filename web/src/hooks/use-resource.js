import { use } from 'react';

export function useResource(promiseOrFunction) {
    const promise = typeof promiseOrFunction === 'function'
        ? promiseOrFunction()
        : promiseOrFunction;
    
    return () => {
        return use(promise); 
    };
}