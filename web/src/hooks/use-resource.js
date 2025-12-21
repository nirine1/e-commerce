import { use } from 'react';

const useResource = (promiseOrFunction) => {
    const promise = typeof promiseOrFunction === 'function'
        ? promiseOrFunction()
        : promiseOrFunction;
    
    return () => {
        return use(promise); 
    };
}

export { useResource };