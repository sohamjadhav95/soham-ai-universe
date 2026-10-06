import { useRef, type ReactNode } from 'react';
import { gsap, EASE, isTouch } from '@/lib/motion';
import { useMagnetic } from '@/lib/useMagnetic';
import { TLink } from '@/lib/transition';
import '@/styles/button.css';

type Props = {
  children: ReactNode;
  variant?: 'round' | 'pill' | 'icon';
  to?: string; // internal route (plays the page transition)
  href?: string; // external link or mailto/tel
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  active?: boolean;
  blue?: boolean;
  dark?: boolean;
  count?: number;
  strength?: number;
  className?: string;
  label?: string; // accessible label for icon buttons
};

/** Magnetic button with the ellipse fill that rises on hover and exits upward on leave. */
export default function Button({
  children,
  variant = 'pill',
  to,
  href,
  onClick,
  type = 'button',
  disabled,
  active,
  blue,
  dark,
  count,
  strength,
  className = '',
  label,
}: Props) {
  const click = useRef<HTMLElement>(null);
  const text = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  useMagnetic(click, text, strength ?? (variant === 'round' ? 60 : 25));

  const enter = () => {
    if (isTouch()) return;
    gsap.fromTo(fill.current, { yPercent: 76 }, { yPercent: 0, duration: 0.5, ease: EASE, overwrite: true });
  };
  const leave = () => {
    if (isTouch()) return;
    gsap.to(fill.current, { yPercent: -76, duration: 0.5, ease: EASE, overwrite: true });
  };

  const inner = (
    <>
      <span className="btn-fill" ref={fill} />
      <span className="btn-text" ref={text}>
        {children}
        {count !== undefined && <span className="btn-count">{count}</span>}
      </span>
    </>
  );

  const common = {
    className: 'btn-click',
    onPointerEnter: enter,
    onPointerLeave: leave,
    'aria-label': label,
  };

  const classes = [
    'btn',
    `btn-${variant}`,
    active && 'is-active',
    blue && 'is-blue',
    dark && 'is-dark',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  let el: ReactNode;
  if (to) {
    el = (
      <TLink to={to} ref={click as never} {...common}>
        {inner}
      </TLink>
    );
  } else if (href) {
    const external = /^https?:/.test(href) || href.endsWith('.pdf');
    el = (
      <a
        href={href}
        ref={click as React.RefObject<HTMLAnchorElement>}
        {...common}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  } else {
    el = (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        ref={click as React.RefObject<HTMLButtonElement>}
        aria-pressed={variant === 'icon' || active !== undefined ? !!active : undefined}
        {...common}
      >
        {inner}
      </button>
    );
  }

  return <div className={classes}>{el}</div>;
}
