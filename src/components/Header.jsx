import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  // Получаем количество активных запросов
  const fetching = useIsFetching();

  return (
    <>
      <div id="main-header-loading">
        {/* Отображаем индикатор загрузки, если есть активные запросы */}
        {fetching > 0 && <progress />}
      </div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
