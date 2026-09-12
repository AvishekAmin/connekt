import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      // Wait for auth initialization (silent refresh) before redirecting
      if (!isLoading && !isAuthenticated) {
        navigate(ROUTES.AUTH);
      }
    }, [isAuthenticated, isLoading, navigate]);

    // Show nothing while auth is initializing
    if (isLoading) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
