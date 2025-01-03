import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  // Хук для программной навигации между страницами.
  const navigate = useNavigate();

  // Хук для получения параметров из URL. В данном случае извлекается параметр `id`.
  const { id } = useParams();

  // Хук useQuery для получения данных о событии с определённым id.
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id], // Уникальный ключ для кэширования данных события с указанным id.
    queryFn: ({ signal }) => fetchEvent({ signal, id }), // Функция для запроса данных события. Передаётся signal для возможности отмены запроса.
  });

  // Хук useMutation для выполнения изменений данных на сервере.
  const { mutate } = useMutation({
    // Функция мутации (обновления данных на сервере).
    mutationFn: updateEvent,

    // Коллбэк, выполняемый перед запросом (оптимистическое обновление данных).
    onMutate: async (data) => {
      const newEvent = data.event; // Новые данные события.

      // Отменяем все запросы с ключом ["events", id], чтобы избежать конфликтов.
      await queryClient.cancelQueries({ queryKey: ["events", id] });

      // Сохраняем текущие данные события в переменной `previousEvent`.
      const previousEvent = queryClient.getQueryData(["events", id]);

      // Обновляем данные в кэше до получения ответа от сервера (оптимистичное обновление).
      queryClient.setQueryData(["events", id], newEvent);

      // Возвращаем сохранённые данные для возможного отката изменений.
      return { previousEvent };
    },

    // Коллбэк, вызываемый при ошибке мутации.
    onError: (error, data, context) => {
      // Восстанавливаем данные в кэше до состояния до изменения.
      queryClient.setQueryData(["events", id], context.previousEvent);
    },

    // Коллбэк, вызываемый после завершения мутации (успех или ошибка).
    onSettled: () => {
      // Помечаем данные с ключом ["events", id] как устаревшие, чтобы запросить обновлённые данные.
      queryClient.invalidateQueries(["events", id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

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
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}
