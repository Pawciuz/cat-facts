import { AlertTriangle } from "lucide-react";

interface ErrorComponentProps {
  message: string;
  title?: string;
}

const ErrorComponent = ({ title = "Oops!", message }: ErrorComponentProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-600" />
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
};
export { ErrorComponent };
