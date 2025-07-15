import logolab from "./img/logolab.jpg";
import iconutilisateur from "./img/iconutilisateur.png";
import { useNavigate } from "react-router-dom";

function Header () {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate("/");
  };
  return (
    <div className="page-container header-container">
      <button className="button-header-studio logo-button" onClick={handleLogoClick}>
        <img
          src={logolab}
          alt="Icon le studio juzely"
          className="header-logo"
        />
      </button>

      <button className="button-header-studio user-button">
        <img 
          src={iconutilisateur}
          alt="icon utilisateur de couleur bleu"
          className="header-user-icon"
        />
      </button>
    </div>
  );
};

export default Header;
