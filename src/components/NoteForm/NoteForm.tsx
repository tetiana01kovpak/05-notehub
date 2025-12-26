import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteTags } from "../../types/note";
import type { NoteTag } from "../../types/note";
import { createNote } from "../../services/noteService";
import type { CreateNotePayload } from "../../services/noteService";
import css from "./NoteForm.module.css";

export interface NoteFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().min(3).max(50).required("Title is required"),
  content: Yup.string().max(500),
  tag: Yup.mixed<NoteTag>().oneOf(noteTags).required("Tag is required"),
});

const initialValues: CreateNotePayload = {
  title: "",
  content: "",
  tag: "Todo",
};

export default function NoteForm({ onCancel, onSuccess }: NoteFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: CreateNotePayload) => createNote(values),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, helpers) => {
        try {
          await mutation.mutateAsync(values);
          await queryClient.invalidateQueries({ queryKey: ["notes"] });
          helpers.resetForm();
          onSuccess?.();
        } catch (error) {
          console.error(error);
        }
      }}
    >
      {({ isSubmitting: formSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" type="text" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              id="content"
              name="content"
              as="textarea"
              rows={8}
              className={css.textarea}
            />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field id="tag" name="tag" as="select" className={css.select}>
              {noteTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={mutation.isPending || formSubmitting}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
