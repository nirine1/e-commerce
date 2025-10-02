import { useState } from "react";
import { useFormik } from 'formik';
import { validationSchema } from "../../validations/login";
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { 
    Alert, 
    AlertDescription 
} from "@/components/ui/alert";
import { FormField } from "../../components/form-field";
import { authService } from "../../services/auth";
import { tokenService } from "../../services/token";

export default function Login() {
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setApiError('');
            setSuccessMessage('');

            try {
                const result = await authService.login({
                    email: values.email,
                    password: values.password,
                });

                if (result.success) {
                    tokenService.setToken(result.data.token);

                    resetForm();

                    alert('Connexion réussie ! Bienvenue ' + result.data.user.name);

                    // Redirection ou autre action après connexion réussie
                    // Par exemple: navigate('/dashboard') avec React Router

                } else {
                    setApiError(result.error);
                }
            } catch (err) {
                alert('Une erreur inattendue s\'est produite');
                console.error('Erreur connexion:', err);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Connexion
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Connectez-vous pour commencer
                    </p>
                </CardHeader>

                <CardContent>
                    {apiError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <FormField
                            name="email"
                            type="email"
                            label="Adresse email"
                            placeholder="nom@exemple.com"
                            formik={formik}
                        />

                        <FormField
                            name="password"
                            type="password"
                            label="Mot de passe"
                            placeholder="Entrez votre mot de passe"
                            formik={formik}
                        />

                        <Button
                            onClick={formik.handleSubmit}
                            type='submit'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            className="w-full cursor-pointer"
                            size="lg"
                        >
                            Se connecter
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Pas encore de compte ?{' '}
                            <button
                                type="button"
                                className="font-medium text-primary hover:underline"
                                onClick={() => console.log('Redirect to register')}
                            >
                                S'inscrire
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
