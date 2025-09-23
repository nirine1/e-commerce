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
                    console.log('Utilisateur:', result.data.user);
                    console.log('Token:', result.data.token);

                    // Sauvegarder le token
                    tokenService.setToken(result.data.token);

                    // Reset du formulaire en cas de succès
                    resetForm();
                    
                    setSuccessMessage('Inscription réussie ! Bienvenue ' + result.data.user.name);

                    // Redirection ou autre action après inscription réussie
                    // Par exemple: navigate('/dashboard') avec React Router

                } else {
                    setApiError(result.error);
                }
            } catch (err) {
                setApiError('Une erreur inattendue s\'est produite');
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
                            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            className="w-full"
                            size="lg"
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Inscription en cours...
                                </>
                            ) : (
                                'S\'inscrire'
                            )}
                        </Button>

                        {apiError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {apiError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    {successMessage}
                                </AlertDescription>
                            </Alert>
                        )}
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