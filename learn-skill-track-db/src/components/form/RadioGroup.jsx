import "../form/form.css";

const RadioGroup = ({ lable, name, value, options, onChange }) => {
  return (
    <div className="form-group">
      <p className="label">{lable}</p>
      <div className="radio-group">
        {options.map((opt) => (
          <label key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;