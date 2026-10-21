import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import "./GlassSelect.css";

/*
  Drop-in replacement for <select>. The native element is kept as the
  trigger (so existing page CSS for `select` still applies), but its OS
  popup is suppressed and a glass menu is rendered in a portal instead.
  onChange receives an event-like object with target.name / target.value.
*/
function GlassSelect({ onChange, onKeyDown, onMouseDown, children, ...props }) {
  const selectRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState(null);

  const updatePosition = useCallback(() => {
    const select = selectRef.current;
    if (!select) return;

    const rect = select.getBoundingClientRect();
    const menuHeight = Math.min(280, options.length * 40 + 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12 && rect.top > spaceBelow;

    setPosition({
      left: rect.left,
      width: rect.width,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    });
  }, [options.length]);

  const openMenu = () => {
    const select = selectRef.current;
    if (!select || select.disabled) return;

    const opts = Array.from(select.options).map((opt) => ({
      value: opt.value,
      label: opt.textContent,
      disabled: opt.disabled,
    }));

    setOptions(opts);
    setCurrentValue(select.value);
    setActiveIndex(Math.max(0, select.selectedIndex));
    setOpen(true);
    select.focus();
  };

  const closeMenu = () => {
    setOpen(false);
    selectRef.current?.focus();
  };

  const choose = (option) => {
    if (!option || option.disabled) return;

    const select = selectRef.current;
    const target = { name: props.name, value: option.value, id: props.id };

    if (option.value !== select?.value) {
      onChange?.({ target, currentTarget: target, preventDefault() {}, stopPropagation() {} });
    }
    closeMenu();
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (selectRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menuRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const moveActive = (step) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let i = 0; i < options.length; i++) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleMouseDown = (e) => {
    onMouseDown?.(e);
    if (e.button !== 0) return;
    e.preventDefault();
    if (open) closeMenu();
    else openMenu();
  };

  const handleKeyDown = (e) => {
    onKeyDown?.(e);

    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(options[activeIndex]);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <select
        {...props}
        ref={selectRef}
        onChange={onChange}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        data-glass-open={open || undefined}
      >
        {children}
      </select>

      {open &&
        position &&
        createPortal(
          <ul
            ref={menuRef}
            className="glass-select-menu"
            role="listbox"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              left: position.left,
              minWidth: position.width,
              top: position.top,
              bottom: position.bottom,
            }}
          >
            {options.map((option, index) => {
              const selected = option.value === currentValue;
              return (
                <li
                  key={`${option.value}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  className={[
                    "glass-select-option",
                    selected && "is-selected",
                    index === activeIndex && "is-active",
                    option.disabled && "is-disabled",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {selected && <span className="glass-select-check">✓</span>}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}

export default GlassSelect;
