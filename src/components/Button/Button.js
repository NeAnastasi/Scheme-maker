import "./Button.css";

const Button = ({
  text,
  onClick,
  variant = "basic",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;
