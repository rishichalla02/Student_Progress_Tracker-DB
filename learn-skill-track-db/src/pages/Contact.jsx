import { useState } from "react";
import InputField from "../components/form/InputField";
import Button from "../components/ui/Button";
import "../style/contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    // Simulated submission
    setTimeout(() => {
      setSuccess("Your message has been sent successfully!");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 800);
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p className="contact-subtitle">
        Have questions or suggestions ? We'd love to hear from you.
      </p>
      <div className="contact-card">
        {error && <div className="contact-error">{error}</div>}
        {success && <div className="contact-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="contact-grid">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <InputField
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
          />
          <div className="textarea-group">
            <label>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message here..."
            />
          </div>
          <div className="contact-action">
            <Button type="submit" variant="primary">
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
