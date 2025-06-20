import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Orders from "./components/my.orders.home/my.orders.home";
import SizeChart from "./components/size.chart/size.chart";
import GarmentSelection from "./components/garment-selection/garment-selection";
import TshirtDesign from "./components/tshirt-design/tshirt-design";
import PullDesign from "./components/pull-design/pull-design";
import HoodieDesign from "./components/hoodie-design/hoodie-design";
import CrewneckDesign from "./components/crewneck-design/crewneck-design";
import LongsleeveDesign from "./components/longsleeve-design/longsleeve-design";
import ZiphoodieDesign from "./components/ziphoodie-design/ziphoodie-design";

function App() {
  return (
    <Router>
      <div className="page-container">
        <div className="App">
          <header className="App-header">
            <Header />
          </header>
          <div className="App-orders">
            <Routes>
              <Route path="/" element={<Orders />} />
              <Route path="/design" element={<GarmentSelection />} />
              <Route path="/Size" element={<SizeChart />} />
              <Route path="/tshirt-design" element={<TshirtDesign />} />
              <Route path="/pull-design" element={<PullDesign />} />
              <Route path="/hoodie-design" element={<HoodieDesign />} />
              <Route path="/crewneck-design" element={<CrewneckDesign />} />
              <Route path="/longsleeve-design" element={<LongsleeveDesign />} />
              <Route path="/ziphoodie-design" element={<ZiphoodieDesign />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
