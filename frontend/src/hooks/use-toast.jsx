import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const useToast = () => {
  const showToast = (message, type = "default") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
        toast.info(message);
        break;
      default:
        toast(message);
    }
  };

  return { showToast };
};
