import * as Yup from 'yup';

export const validationSchema = Yup.object({
    email: Yup.string()
        .email('Adresse email invalide')
        .required('L\'email est requis'),

    password: Yup.string()
        .required('Le mot de passe est requis'),
});
