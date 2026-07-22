"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
  variant?: "default" | "search";
  wrapClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { icon, error, label, hint, variant = "default", className = "", wrapClassName = "", id, ...props },
    ref
  ) {
    const inputId = id || (label ? `input-${Math.random().toString(36).slice(2, 7)}` : undefined);

    if (variant === "search") {
      return (
        <div className={`input-wrap ${wrapClassName}`}>
          {icon && (
            <span className="input-icon">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`search-input ${className}`}
            {...props}
          />
        </div>
      );
    }

    if (label || hint || error) {
      return (
        <div className={`field ${wrapClassName}`}>
          {label && (
            <label htmlFor={inputId} className="field-label">
              {label}
            </label>
          )}
          <div className="input-wrap">
            {icon && <span className="input-icon">{icon}</span>}
            <input
              ref={ref}
              id={inputId}
              className={`input ${icon ? "pr-10" : ""} ${error ? "input-error" : ""} ${className}`}
              aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
              aria-invalid={error ? true : undefined}
              {...props}
            />
          </div>
          {hint && !error && (
            <p id={`${inputId}-hint`} className="field-hint">{hint}</p>
          )}
          {error && (
            <p id={`${inputId}-error`} className="field-error" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>
      );
    }

    // Simple inline
    if (icon) {
      return (
        <div className={`input-wrap ${wrapClassName}`}>
          <span className="input-icon">{icon}</span>
          <input
            ref={ref}
            id={inputId}
            className={`input ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        id={inputId}
        className={`input ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
