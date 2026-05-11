import "./Loading.css";
const Loading = ({ text = "Загрузка...", fullScreen = false }) => {
  const className = fullScreen ? "loading loading-fullscreen" : "loading";
  return (
    <div className={className}>
      <div className="loading-card">{text}</div>
    </div>
  );
};

export default Loading;
