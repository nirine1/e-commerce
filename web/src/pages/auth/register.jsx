import { useState } from "react";
import { useFormik } from 'formik';
import { validationSchema } from "../../validations/register";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { FormField } from "../../components/form-field";
import { authService } from "../../services/auth";
import { tokenService } from "../../services/token";

export default function Register() {
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setApiError('');
            setSuccessMessage('');

            try {
                const result = await authService.register({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    passwordConfirmation: values.passwordConfirmation
                });

                if (result.success) {
                    tokenService.setToken(result.data.token);

                    resetForm();
                    
                    alert('Inscription réussie ! Bienvenue ' + result.data.user.name);

                    // Redirection ou autre action après inscription réussie
                    // Par exemple: navigate('/dashboard') avec React Router

                } else {
                    setApiError(result.error);
                }
            } catch (err) {
                alert('Une erreur inattendue s\'est produite');
                console.error('Erreur inscription:', err);
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
                        Inscription
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Créez votre compte pour commencer
                    </p>
                </CardHeader>
                
                <CardContent>
                    <div className="space-y-4">
                        <FormField
                            name="name"
                            label="Nom complet"
                            placeholder="Entrez votre nom complet"
                            formik={formik}
                        />

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
                            placeholder="Créez un mot de passe sécurisé"
                            formik={formik}
                        />

                        <FormField
                            name="passwordConfirmation"
                            type="password"
                            label="Confirmer le mot de passe"
                            placeholder="Confirmez votre mot de passe"
                            formik={formik}
                        />

                        <Button
                            onClick={formik.handleSubmit}
                            type='submit'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            className="w-full"
                            size="lg"
                        >
                            S'inscrire
                        </Button>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Déjà un compte ?{' '}
                            <button 
                                type="button"
                                className="font-medium text-primary hover:underline"
                                onClick={() => console.log('Redirect to login')}
                            >
                                Se connecter
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}