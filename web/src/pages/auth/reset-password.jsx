import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import { validationSchema } from "../../validations/reset-password";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "../../components/form-field";
import { authService } from "../../services/auth";
import { tokenService } from "../../services/token";

const searchParams = new URLSearchParams(window.location.search);
const validForm = searchParams.has('email') && searchParams.has('token');

export default function Register() {
    const [apiError, setApiError] = useState(!validForm ? 'Lien invalide' : '');
    const [successMessage, setSuccessMessage] = useState('');
    const [countDown, setCountDown] = useState(4);

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: searchParams.get('email'),
            token: searchParams.get('token'),
            password: '',
            passwordConfirmation: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setApiError('');
            setSuccessMessage('');

            try {
                const result = await authService.resetPassword({
                    email: values.email,
                    token: values.token,
                    password: values.password,
                    passwordConfirmation: values.passwordConfirmation
                });

                if (result.success) {
                    tokenService.setToken(result.data.token);

                    resetForm();

                    useEffect(() => {
                        if (countDown > 0) {
                            const timer = setInterval(() => {
                                setCountDown(prev => prev - 1);
                            }, 1000);

                            setSuccessMessage(`Nouveau mot de passe enregistré ! Vous allez être redirigé vers la page de connexion dans ${countDown}s`);

                            return () => clearInterval(timer);
                        } else if (countDown === 0) {
                            navigate("/login");
                        }
                    }, [countDown, navigate]);

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
                        Réinitialiser mon mot de passe
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Veuillez entrer votre nouveau mot de passe
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
                            type="hidden"
                            formik={formik}
                        />

                        <FormField
                            name="token"
                            type="hidden"
                            formik={formik}
                        />

                        <FormField
                            name="password"
                            type="password"
                            disabled={!validForm}
                            label="Mot de passe"
                            placeholder="Créez un mot de passe sécurisé"
                            formik={formik}
                        />

                        <FormField
                            name="passwordConfirmation"
                            type="password"
                            disabled={!validForm}
                            label="Confirmer le mot de passe"
                            placeholder="Confirmez votre mot de passe"
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
                            Changer mon mot de passe
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}