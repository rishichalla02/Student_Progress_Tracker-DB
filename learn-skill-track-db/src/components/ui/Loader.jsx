import "../ui/loader.css";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-backdrop">
      <div className="loader-box">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Loader;
