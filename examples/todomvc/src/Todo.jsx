import React, { useEffect, useRef } from 'react';
import { useMachine } from './useMachine';
import { todoMachine } from './todoMachine';
import cn from 'classnames';

export function Todo({ todo, onChange, onDelete, onComplete }) {
  const inputRef = useRef(null);
  const [state, send] = useMachine(
    todoMachine.withConfig(
      {
        actions: {
          focusInput() {
            setTimeout(() => {
              inputRef.current && inputRef.current.select();
            }, 0);
          },
          notifyDeleted(ctx) {
            onDelete(ctx.id);
          },
          notifyChanged(ctx) {
            onChange(ctx);
          }
        }
      },
      todo // extended state
    )
  );

  useEffect(
    () => {
      if (todo.completed !== state.context.completed) {
        // "Completed" changed externally... ugh.
        send('TOGGLE_COMPLETE');
      }
    },
    [todo]
  );

  return (
    <li
      className={cn({
        editing: state.matches('editing'),
        completed: state.context.completed
      })}
      data-todo-state={state.context.completed ? 'completed' : 'active'}
      key={todo.id}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          onChange={_ => {
            send('TOGGLE_COMPLETE');
          }}
          value={state.context.completed}
          checked={state.context.completed}
        />
        <label
          onDoubleClick={e => {
            send('EDIT');
          }}
        >
          {state.context.title}
        </label>{' '}
        <button className="destroy" onClick={() => send('DELETE')} />
      </div>
      <input
        className="edit"
        value={state.context.title}
        onBlur={_ => send('BLUR')}
        onChange={e => send({ type: 'CHANGE', value: e.target.value })}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            send('COMMIT');
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            send('CANCEL');
          }
        }}
        ref={inputRef}
      />
    </li>
  );
}
