import { useQuery } from "@tanstack/react-query"; // Хук для управления запросами данных.
import { useRef, useState } from "react"; // Хуки React для работы с состоянием и ссылками.
import { fetchEvents } from "../../util/http"; // Функция для получения событий с сервера.
import LoadingIndicator from "../UI/LoadingIndicator"; // Компонент индикатора загрузки.
import ErrorBlock from "../UI/ErrorBlock"; // Компонент для отображения ошибок.
import EventItem from "./EventItem"; // Компонент для отображения одного события.

export default function FindEventSection() {
  const searchElement = useRef(); // Используется для управления полем ввода.
  const [searchTerm, setSearchTerm] = useState(); // Состояние для хранения текущего поискового запроса.

  // Используем useQuery для получения событий, зависящих от searchTerm.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { search: searchTerm }], // Уникальный ключ для запроса, зависящий от поискового термина.
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }), // Функция с поддержкой отмены запроса.
    enabled: searchTerm !== undefined, // Запрос выполняется только если searchTerm определен.
  });

  //queryFn с signal: NOTE
  // signal передается в fetchEvents для привязки возможности отмены запроса.
  // Это позволяет TanStack Query автоматически отменять запросы, которые больше не нужны (например, если пользователь вводит новый поисковый термин).

  // Обработчик отправки формы, обновляет состояние поискового термина.
  function handleSubmit(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы.
    setSearchTerm(searchElement.current.value); // Устанавливаем новое значение для searchTerm.
  }

  // По умолчанию отображается текст с инструкцией.
  let content = <p>Please enter a search term to find events.</p>;

  // Если запрос выполняется, отображаем индикатор загрузки.
  if (isLoading) {
    content = <LoadingIndicator />;
  }

  // Если произошла ошибка, отображаем компонент ошибки.
  if (isError) {
    content = (
      <ErrorBlock
        title="An error occured" // Заголовок сообщения об ошибке.
        message={error.info?.message || "Failed to fetch events."} // Сообщение об ошибке.
      />
    );
  }

  // Если данные успешно загружены, отображаем список событий.
  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />{" "}
            {/* Компонент для отображения отдельного события. */}
          </li>
        ))}
      </ul>
    );
  }

  // Возвращаем секцию с формой поиска и динамическим контентом.
  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2> {/* Заголовок секции. */}
        {/* Форма для ввода поискового термина. */}
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search" // Поле для ввода текста поиска.
            placeholder="Search events" // Текст-подсказка в поле ввода.
            ref={searchElement} // Привязка ссылки к элементу.
          />
          <button>Search</button> {/* Кнопка для отправки формы. */}
        </form>
      </header>
      {content}{" "}
      {/* Динамический контент: инструкция, загрузка, ошибка или список событий. */}
    </section>
  );
}
