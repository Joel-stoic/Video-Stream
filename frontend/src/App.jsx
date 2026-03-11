import { BrowserRouter, Routes, Route } from "react-router-dom";
import Watch from "./pages/Watch";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/watch/:id" element={<Watch />} />
      </Routes>
    </BrowserRouter>
  );
}