import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent, // Функция, которая выполняет запрос на создание нового события.
    onSuccess: () => {
      // Когда мутация проходит успешно:
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Инвалидируем кэш для запроса с ключом "events", чтобы обновить данные.
      navigate("/events"); // После успешного создания события, перенаправляем пользователя на страницу со списком событий.
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData }); // Передаем данные из формы в функцию мутации.
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            "Failed to create event, pls check your inputs"
          }
        />
      )}
    </Modal>
  );
}
