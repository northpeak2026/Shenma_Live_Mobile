import { KeyboardProvider } from "./mobile";
import { MobileDeviceProvider } from "./mobile/Device";
import Prototype from "./Prototype";

export default function App() {
  return (
    <MobileDeviceProvider>
      <KeyboardProvider>
        <main className="h5-stage">
          <div className="mobile-h5-container" data-testid="mobile-h5-container">
            <Prototype />
          </div>
        </main>
      </KeyboardProvider>
    </MobileDeviceProvider>
  );
}
