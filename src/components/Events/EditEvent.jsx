import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
// import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  // Хук для программной навигации между страницами.
  const navigate = useNavigate();

  // Хук useNavigation предоставляет информацию о состоянии текущей навигации.
  // В данном случае используется `state` для отслеживания, находится ли приложение в процессе отправки данных.
  const { state } = useNavigation();

  // Хук useSubmit используется для программной отправки формы или данных.
  // Позволяет отправлять данные без использования HTML-формы напрямую.
  const submit = useSubmit();

  // Хук для получения параметров из URL. В данном случае извлекается параметр `id`.
  const { id } = useParams();

  // Хук useQuery для получения данных о событии с определённым id.
  const {
    data,
    //  isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id], // Уникальный ключ для кэширования данных события с указанным id.
    queryFn: ({ signal }) => fetchEvent({ signal, id }), // Функция для запроса данных события. Передаётся signal для возможности отмены запроса.
    staleTime: 10000,
  });

  // Хук useMutation для выполнения изменений данных на сервере.
  // const { mutate } = useMutation({
  //   // Функция мутации (обновления данных на сервере).
  //   mutationFn: updateEvent,

  //   // Коллбэк, выполняемый перед запросом (оптимистическое обновление данных).
  //   onMutate: async (data) => {
  //     const newEvent = data.event; // Новые данные события.

  //     // Отменяем все запросы с ключом ["events", id], чтобы избежать конфликтов.
  //     await queryClient.cancelQueries({ queryKey: ["events", id] });

  //     // Сохраняем текущие данные события в переменной `previousEvent`.
  //     const previousEvent = queryClient.getQueryData(["events", id]);

  //     // Обновляем данные в кэше до получения ответа от сервера (оптимистичное обновление).
  //     queryClient.setQueryData(["events", id], newEvent);

  //     // Возвращаем сохранённые данные для возможного отката изменений.
  //     return { previousEvent };
  //   },

  //   // Коллбэк, вызываемый при ошибке мутации.
  //   onError: (error, data, context) => {
  //     // Восстанавливаем данные в кэше до состояния до изменения.
  //     queryClient.setQueryData(["events", id], context.previousEvent);
  //   },

  //   // Коллбэк, вызываемый после завершения мутации (успех или ошибка).
  //   onSettled: () => {
  //     // Помечаем данные с ключом ["events", id] как устаревшие, чтобы запросить обновлённые данные.
  //     queryClient.invalidateQueries(["events", id]);
  //   },
  // });

  function handleSubmit(formData) {
    // Альтернативный подход: использование мутации через React Query
    // mutate({ id, event: formData });

    // Альтернативный подход: программная навигация
    // navigate("../");

    // Используем `submit` для отправки данных. Указываем метод "PUT" для обновления данных.
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load events"
          message={error.info?.message || "Failed to load event"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {/* Отображаем состояние формы в зависимости от `state`. */}
        {state === "submitting" ? (
          // Если данные отправляются, показываем сообщение о процессе отправки.
          <p>Sending data...</p>
        ) : (
          <>
            {/* Кнопка для отмены. Перенаправляет пользователя на родительский маршрут ("../"). */}
            <Link to="../" className="button-text">
              Cancel
            </Link>

            {/* Кнопка для отправки формы. Когда форма отправляется, вызывается handleSubmit. */}
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
        {/* <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button> */}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

// Альтернатива useMutation при использовании React Router
// Функция загрузчика данных для маршрута. Она используется в React Router для предварительной загрузки данных перед рендерингом страницы.
export function loader({ params }) {
  return queryClient.fetchQuery({
    // Уникальный ключ для кэширования данных события с указанным id.
    queryKey: ["events", params.id],

    // Функция для получения данных события.
    // Использует `signal` для отмены запроса, если он больше не нужен.
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

// Функция для обработки действий (например, отправки формы) на маршруте.
// Используется в React Router для выполнения побочных эффектов, таких как обновление данных.
export async function action({ request, params }) {
  // Извлекаем данные формы из запроса. `formData` содержит все поля формы и их значения.
  const formData = await request.formData();

  // Преобразуем данные формы в объект.
  // Например, если форма содержит поля name и date, получится объект: { name: "value", date: "value" }.
  const updatedEventData = Object.fromEntries(formData);

  // Отправляем запрос на сервер для обновления данных события.
  // Передаём id события и обновлённые данные.
  await updateEvent({ id: params.id, event: updatedEventData });

  // Помечаем данные с ключом ["events"] как устаревшие, чтобы запросить их заново.
  // Это гарантирует, что после обновления данные в приложении будут актуальными.
  queryClient.invalidateQueries(["events"]);

  // Перенаправляем пользователя на предыдущий маршрут ("../").
  // Обычно используется для возврата на список событий или главную страницу.
  return redirect("../");
}
