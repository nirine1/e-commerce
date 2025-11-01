import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary';
import { useResource } from '../hooks/use-resource';

const ResourceList = ({
    service, 
    renderItem,
    emptyMessage = "No resources found.",
    loadingMessage = "Loading resources..."
}) => {
    const getResource = useResource(service);

    const ListContent = () => {
        const items = getResource();

        if(!items || items.length === 0) {
            return <div>{emptyMessage}</div>;
        }

        return (
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        {renderItem(item)}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<div>{loadingMessage}</div>}>
                <ListContent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default ResourceList