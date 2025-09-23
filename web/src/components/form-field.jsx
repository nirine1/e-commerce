const FormField = ({ label, type = 'text', formik, name, placeholder, ...props }) => {
    const hasError = formik.touched[name] && formik.errors[name];
    
    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={name} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={formik.isSubmitting}
                className={hasError ? "border-red-500 focus:border-red-500" : ""}
                {...formik.getFieldProps(name)}
                {...props}
            />
            {hasError && (
                <p className="text-sm text-red-500 mt-1">
                    {formik.errors[name]}
                </p>
            )}
        </div>
    );
};