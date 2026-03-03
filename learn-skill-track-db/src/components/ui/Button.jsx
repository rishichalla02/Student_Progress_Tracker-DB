import "../ui/button.css";

const Button = ({
  children,
  type = "button",
  onClick,
  variant,
  style = {},
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${disabled ? "btn-disabled" : ""} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
