import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { paymentService } from "../../services/payment";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Spinner } from "../../components/ui/spinner";

const SuccessCheckout = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const result = await paymentService.verifyPayment({ sessionId: searchParams.get('session_id') });

        if (result.success ?? false) {
            setIsPaymentVerified(true);

            setTimeout(() => {
                window.location.href = `/products/`;
            }, 5000);
        } else {
            // show an alert of failed notification
            setIsPaymentVerified(false);
        }

        setIsLoading(false);
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            { 
                                isLoading ? 'Vérification de la commande' 
                                    : (isPaymentVerified ? 'Commande OK' : 'Commande PAS OK')
                            }
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            { 
                                isLoading ? 'Votre commande est en cours de vérification, veuillez patienter...' 
                                    : (isPaymentVerified ? 'Votre commande a bien été prise en compte' : 'Votre commande n\'a pas pu être vérifié')
                            }
                        </p>
                    </CardHeader>
    
                    <CardContent>
                        { isLoading ?         
                            <div className="flex w-full items-center justify-center"><Spinner className="h-4 w-4 text-blue-500" /></div>
                            : '' }

                        { !isLoading && isPaymentVerified && 'Vous allez être redirigé vers la page d\'accueil dans quelques instants...' }
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default SuccessCheckout;
