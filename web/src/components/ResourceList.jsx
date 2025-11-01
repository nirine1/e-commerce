import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary';
import { useResource } from '../hooks/use-resource';
import LoadingMessage from './LoadingMessage';

const ResourceList = ({
    service, 
    renderItems,
    emptyMessage = "Aucune ressource trouvée.",
    loadingMessage = "Chargement des ressources..."
}) => {
    const getResource = useResource(service);

    const ListContent = () => {
        const items = getResource();

        if(!items || items.length === 0) {
            return <div>{emptyMessage}</div>;
        }

        return (
            renderItems(items)
        );
    }

    

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingMessage message={loadingMessage} />}>
                <ListContent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default ResourceList