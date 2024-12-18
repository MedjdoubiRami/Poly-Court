import Plateau from "../components/plateau";
//import Header from "../components/header";
import "./home.css";
import basketball from "../assets/basketball.png";
import soccer from "../assets/soccer.png";
import tennis from "../assets/tennis.png";
import { Link } from "react-router-dom";
import { useReservationSystem } from "../hooks/useReservationSystem";

const HomePage = () => {
  const { plateaus } = useReservationSystem(); // obtient les plateaus 
  return (
    <div className="homepage">
      <h1 className="title">Choisissez un plateau pour commencer!</h1>
      <div className="card-container">
        {/* Chargement dynamique des plateaux */}
        {plateaus.map((plateau) => (
          <Link key={plateau.id} to={`/plateau/${plateau.id}`}>
            <Plateau
              image={
                plateau.id === "p1" ? basketball :
                plateau.id === "p2" ? soccer :
                plateau.id === "p3" ? tennis :
                null 
              }
              title={plateau.name} 
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
