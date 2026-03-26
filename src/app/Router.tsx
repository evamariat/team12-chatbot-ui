import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "../features/chat/pages/ChatPage";
import DocsPage from "../features/docs/pages/DocsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatPage />,
  },
  {
    path: "/docs",
    element: <DocsPage />,
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
