import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { validationSchema } from "../../validations/login";
import { Button } from '@/components/ui/button';
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
import { FormField } from "../../components/form-field";
import { useAuth } from "../../contexts/auth";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setApiError('');
            try {
                await login(values.email, values.password);
                resetForm();
                navigate("/dashboard");
            } catch (err) {
                setApiError(err.message || "Erreur de connexion");
            } finally {
                setSubmitting(false);
            }
        },
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

                    <form className="space-y-4" onSubmit={formik.handleSubmit}>
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

                        <div>
                            <p className="text-sm text-muted-foreground">
                                <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </p>
                        </div>

                        <Button
                            onClick={formik.handleSubmit}
                            type='submit'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            className="w-full cursor-pointer"
                            size="lg"
                        >
                            {formik.isSubmitting && <Spinner />}
                            Se connecter
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-medium text-primary hover:underline">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
