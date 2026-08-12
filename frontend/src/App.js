import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import SmoothScroll from "@/components/SmoothScroll";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Catalog from "@/pages/Catalog";
import Cleaning from "@/pages/Cleaning";
import Enquiry from "@/pages/Enquiry";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <SmoothScroll>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cleaning" element={<Cleaning />} />
              <Route path="/enquiry" element={<Enquiry />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </SmoothScroll>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
