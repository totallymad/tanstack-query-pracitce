import { QueryClient } from "@tanstack/react-query";

// Создаем новый клиент для TanStack Query, который будет управлять кэшированием и запросами данных.
export const queryClient = new QueryClient();

export async function fetchEvents({ signal, searchTerm, max }) {
  //   console.log(searchTerm); // Вывод поискового термина в консоль для отладки.

  // Базовый URL для запроса событий.
  let url = "http://localhost:3000/events";

  if (searchTerm && max) {
    url += "?search=" + searchTerm + "&max=" + max;
  } else if (searchTerm) {
    url += "?search=" + searchTerm; // Формируем строку с параметром поиска.
  } else if (max) {
    url += "?max=" + max;
  }

  //   signal: NOTE
  // Передается в метод fetch для привязки отмены запроса.
  // Если запрос отменяется (например, при смене searchTerm), fetch выбрасывает исключение AbortError.

  // Выполняем HTTP-запрос с привязкой сигнала для отмены.
  const response = await fetch(url, { signal: signal });

  // Если ответ не успешен (status не 2xx), создаем и выбрасываем ошибку.
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events"); // Сообщение об ошибке.
    error.code = response.status; // Добавляем HTTP-статус ошибки.
    error.info = await response.json(); // Получаем тело ответа для детализации ошибки.
    throw error; // Прерываем выполнение и передаем ошибку в вызывающий код.
  }

  // Парсим JSON-ответ от сервера.
  const { events } = await response.json(); // Ожидаем, что сервер вернет объект с ключом `events`.

  // Возвращаем массив событий.
  return events;
}

export async function createNewEvent(eventData) {
  // Отправляем запрос на сервер для создания нового события.
  const response = await fetch(`http://localhost:3000/events`, {
    method: "POST", // Используем метод POST для создания данных.
    body: JSON.stringify(eventData), // Преобразуем объект eventData в строку JSON для отправки.
    headers: {
      "Content-Type": "application/json", // Устанавливаем заголовок для указания типа данных.
    },
  });

  // Проверяем, успешен ли ответ от сервера (статус 2xx).
  if (!response.ok) {
    const error = new Error("An error occurred while creating the event"); // Если ошибка, создаем объект ошибки.
    error.code = response.status; // Присваиваем код статуса ответа для диагностики.
    error.info = await response.json(); // Получаем тело ошибки из ответа (например, детали ошибки от сервера).
    throw error; // Выбрасываем ошибку для обработки на более высоком уровне.
  }

  // Если запрос успешен, извлекаем данные события из ответа.
  const { event } = await response.json(); // Ожидаем, что сервер вернет объект с полем `event`.

  // Возвращаем данные о созданном событии.
  return event;
}

export async function fetchSelectableImages({ signal }) {
  // Отправляем GET-запрос для получения списка изображений.
  const response = await fetch(`http://localhost:3000/events/images`, {
    signal, // Передаем signal для отмены запроса, если необходимо.
  });

  // Проверяем, успешен ли ответ от сервера (статус 2xx).
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the images"); // Если ошибка, создаем объект ошибки.
    error.code = response.status; // Присваиваем код статуса ответа для диагностики.
    error.info = await response.json(); // Получаем тело ошибки из ответа (например, детали ошибки от сервера).
    throw error; // Выбрасываем ошибку для обработки на более высоком уровне.
  }

  // Если запрос успешен, извлекаем список изображений из ответа.
  const { images } = await response.json(); // Ожидаем, что сервер вернет объект с полем `images`.

  // Возвращаем массив изображений.
  return images;
}

// Функция для получения данных о конкретном событии.
export async function fetchEvent({ id, signal }) {
  // Выполняем HTTP-запрос для получения данных события по ID.
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    signal, // Передаем сигнал для поддержки отмены запроса через AbortController.
  });

  // Проверяем успешность запроса.
  if (!response.ok) {
    // Если запрос не успешен, создаем объект ошибки с дополнительной информацией.
    const error = new Error("An error occurred while fetching the event");
    error.code = response.status; // Код HTTP-статуса ошибки.
    error.info = await response.json(); // Подробное сообщение об ошибке из тела ответа.
    throw error; // Выбрасываем ошибку, чтобы её можно было обработать в вызывающем коде.
  }

  // Извлекаем данные события из JSON-ответа.
  const { event } = await response.json();

  // Возвращаем объект события.
  return event;
}

// Функция для удаления конкретного события.
export async function deleteEvent({ id }) {
  // Выполняем HTTP-запрос для удаления события по ID.
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: "DELETE", // Указываем HTTP-метод DELETE для удаления ресурса.
  });

  // Проверяем успешность запроса.
  if (!response.ok) {
    // Если запрос не успешен, создаем объект ошибки с дополнительной информацией.
    const error = new Error("An error occurred while deleting the event");
    error.code = response.status; // Код HTTP-статуса ошибки.
    error.info = await response.json(); // Подробное сообщение об ошибке из тела ответа.
    throw error; // Выбрасываем ошибку, чтобы её можно было обработать в вызывающем коде.
  }

  // Возвращаем результат успешного удаления (обычно подтверждение или сообщение).
  return response.json();
}

export async function updateEvent({ id, event }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: "PUT",
    body: JSON.stringify({ event }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while updating the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}
