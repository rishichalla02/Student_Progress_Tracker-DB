import Navbar from "../layout/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default DashboardLayout;