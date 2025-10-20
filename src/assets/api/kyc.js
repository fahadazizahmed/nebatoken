
import invoke from "../utils/invoke";

export const initiateKycApplication = (data) => {
    return invoke({
        method: "POST",
        baseURL: import.meta.env.VITE_APP_BACKEND_URL,
        route: "sumsub/createApplicant",
        data: data,
    });
};

