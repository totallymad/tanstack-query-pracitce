import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query"; // Импорт хуков для работы с React Query.
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false); // Локальное состояние для управления модальным окном удаления.

  const { id } = useParams(); // Получение ID события из параметров маршрута.
  const navigate = useNavigate(); // Хук для навигации.

  // Получение данных о событии с помощью useQuery.
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id], // Уникальный ключ для кэширования данных о конкретном событии.
    queryFn: ({ signal }) => fetchEvent({ signal, id }), // Функция запроса данных события. Используется поддержка отмены запроса.
  });

  // Удаление события с помощью useMutation.
  const {
    mutate, // Функция для вызова мутации.
    isPending: isPendingDeleting, // Состояние ожидания выполнения запроса.
    isError: isErrorDeleting, // Состояние ошибки при удалении.
    error: deleteError, // Информация об ошибке удаления.
  } = useMutation({
    mutationFn: deleteEvent, // Функция для выполнения запроса удаления события.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"], // Указываем ключ кэша, который нужно обновить после удаления события.
        refetchType: "none", // Запрещаем автоматическое перезапрос данных (по желанию).
      });
      navigate("/events"); // Перенаправление на список событий после успешного удаления.
    },
  });

  function handleStarDelete() {
    setIsDeleting(true); // Открытие модального окна подтверждения удаления.
  }

  function handleStopDelete() {
    setIsDeleting(false); // Закрытие модального окна подтверждения удаления.
  }

  function handleDelete() {
    mutate({ id }); // Вызов функции мутации для удаления события.
  }

  let content;

  // Обработка состояния ожидания данных события.
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  // Обработка ошибки получения данных события.
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occured" // Заголовок сообщения об ошибке.
          message={error.info?.message || "Failed to fetch event."} // Сообщение об ошибке.
        />
      </div>
    );
  }

  // Отображение данных события при успешном их получении.
  if (data) {
    content = (
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStarDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      {/* Модальное окно подтверждения удаления */}
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            {isPendingDeleting && <p>Deleting, please wait..</p>}
            {!isPendingDeleting && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Confirm
                </button>
              </>
            )}
            {/* Сообщение об ошибке при удалении */}
            {isErrorDeleting && (
              <ErrorBlock
                title="Failed to delete event"
                message={
                  deleteError.info?.message ||
                  "Failed to delete event, please try again later"
                }
              />
            )}
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}
