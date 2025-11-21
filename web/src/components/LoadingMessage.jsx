import { Spinner } from "@/components/ui/spinner";

const LoadingMessage = ({ message }) => (
    <div className="flex items-center justify-center p-4">
        <Spinner className="mr-2 h-4 w-4 text-blue-500" />
        {message}
    </div>
);

export default LoadingMessage;