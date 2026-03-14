import Maintenance from "./pages/Maintenance";

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = true;

const App = () => {
  // If maintenance mode is enabled, show only the maintenance page
  if (MAINTENANCE_MODE) {
    return <Maintenance />;
  }

  // Normal app rendering (disabled during maintenance)
  return null;
};

export default App;
