import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary a attrapé une erreur:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Alert variant="destructive" className="m-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Une erreur est survenue</AlertTitle>
                    <AlertDescription className="mt-2">
                        {this.state.error?.message || 'Erreur inconnue'}
                    </AlertDescription>
                    <button
                        onClick={this.handleReset}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </Alert>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;