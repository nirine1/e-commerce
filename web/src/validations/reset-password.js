import * as Yup from 'yup';

export const validationSchema = Yup.object({
    token: Yup.string()
        .required('Lien invalide'),

    email: Yup.string()
        .email('Lien invalide')
        .required('Lien invalide'),

    password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
        )
        .required('Le mot de passe est requis'),

    passwordConfirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
        .required('La confirmation du mot de passe est requise')
});