import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { useTheme } from "./hooks/useTheme";
import { router } from "./router";

export default function App() {
  useTheme();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
