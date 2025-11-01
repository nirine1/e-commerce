import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary';
import { useResource } from '../hooks/use-resource';
import { Spinner } from "@/components/ui/spinner";

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

    const LoadingMessage = () => (
        <div className="flex items-center justify-center p-4">
            <Spinner className="mr-2 h-4 w-4 text-blue-500" />
            {loadingMessage}
        </div>
    );

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingMessage />}>
                <ListContent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default ResourceList