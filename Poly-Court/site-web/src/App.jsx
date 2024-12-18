import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import PlateauPage from "./pages/plateau";
import ReservationPage from "./pages/reservation";
import Header from "./components/header"; // Ajouter le header
import { ReservationProvider } from "./context/reservation-context";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* TODO : Ajouter l'entête au début de chaque page  */}
      <ReservationProvider>
        <Header /> {/* Le Header sera affiché avant les routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plateau/:plateauId" element={<PlateauPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route
            path="/reservation/:selectedPlateau"
            element={<ReservationPage />}
          />
        </Routes>
      </ReservationProvider>
    </Router >
  );
}

export default App;
