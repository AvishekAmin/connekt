import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading, isLoggingOut } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated && !isLoggingOut) {
        navigate(ROUTES.AUTH, {
          state: {
            redirectTo: location.pathname + location.search,
            formState: 0,
          },
          replace: true,
        });
      }
    }, [isAuthenticated, isLoading, isLoggingOut, navigate, location]);

    if (isLoading || isLoggingOut) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
