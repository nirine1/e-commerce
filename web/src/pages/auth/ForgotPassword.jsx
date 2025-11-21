import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { validationSchema } from "../../validations/forgot-password";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { FormField } from "../../components/FormField";
import { authService } from "../../services/auth";
import { tokenService } from "../../services/token";

export default function ForgotPassword() {
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setApiError('');
            setSuccessMessage('');

            try {
                const result = await authService.forgotPassword({
                    email: values.email,
                });

                if (result.success) {
                    tokenService.setToken(result.data.token);

                    resetForm();

                    setSuccessMessage('Un email a été envoyé à ' + values.email)
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
                        Mot de passe oublié ?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Pas de soucis, nous vous enverrons un email
                    </p>
                </CardHeader>

                <CardContent>
                    {successMessage && (
                        <Alert className="mb-4">
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {apiError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                    )}

                    <form className="space-y-4" onSubmit={formik.handleSubmit}>
                        <FormField
                            name="email"
                            type="email"
                            label="Adresse email"
                            placeholder="nom@exemple.com"
                            formik={formik}
                        />

                        <Button
                            onClick={formik.handleSubmit}
                            type='submit'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            className="w-full cursor-pointer"
                            size="lg"
                        >
                            {formik.isSubmitting && <Spinner />}
                            Réinitialiser le mot de passe
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Retour à la {' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                connexion
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
