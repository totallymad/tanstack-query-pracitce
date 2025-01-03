import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Events from "./components/Events/Events.jsx";
import EventDetails from "./components/Events/EventDetails.jsx";
import NewEvent from "./components/Events/NewEvent.jsx";
import EditEvent, {
  loader as editEventLoader,
  action as editEventAction,
} from "./components/Events/EditEvent.jsx";
import {
  // QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { queryClient } from "./util/http.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/events" />,
  },
  {
    path: "/events",
    element: <Events />,

    children: [
      {
        path: "/events/new",
        element: <NewEvent />,
      },
    ],
  },
  {
    path: "/events/:id",
    element: <EventDetails />,
    children: [
      {
        path: "/events/:id/edit",
        element: <EditEvent />,
        // альтернатива useMutation при использовании react router
        loader: editEventLoader,
        action: editEventAction,
      },
    ],
  },
]);

// Создаем новый клиент для TanStack Query, который будет управлять кэшированием и запросами данных.
// const queryClient = new QueryClient();

function App() {
  return (
    // Оборачиваем приложение в провайдер QueryClientProvider, чтобы все дочерние компоненты могли использовать функционал TanStack Query.
    <QueryClientProvider client={queryClient}>
      {/* Используем RouterProvider для маршрутизации приложения. */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
