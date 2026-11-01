export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  style,
  disabled,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`app-button ${variant === 'secondary' ? 'secondary' : ''} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}