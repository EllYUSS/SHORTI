import { useEffect, type PropsWithChildren } from "react";
import { MobileDeviceProvider, useMobileDevice } from "./Device";
import { KeyboardDock, KeyboardProvider, useKeyboard } from "./Keyboard";
import { PhoneFrame } from "./PhoneFrame";
import { HomeIndicator, StatusBar } from "./components";

export function MobileRuntime({ children }: PropsWithChildren) {
  const fullPagePreview =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "full";

  return (
    <MobileDeviceProvider>
      <PhoneFrame fullScreen={fullPagePreview}>
        <KeyboardProvider simulate={!fullPagePreview}>
          {!fullPagePreview ? <KeyboardPreview /> : null}
          {!fullPagePreview ? <StatusBar /> : null}
          <MobileAppViewport>{children}</MobileAppViewport>
          {!fullPagePreview ? <HomeIndicator /> : null}
          {!fullPagePreview ? <KeyboardDock /> : null}
        </KeyboardProvider>
      </PhoneFrame>
    </MobileDeviceProvider>
  );
}

function MobileAppViewport({ children }: PropsWithChildren) {
  const { device } = useMobileDevice();
  const keyboard = useKeyboard();

  return (
    <div
      className="mobile-app-viewport"
      data-keyboard-visible={keyboard.visible ? "true" : "false"}
      data-platform={device.platform}
      data-testid="mobile-app-viewport"
    >
      {children}
    </div>
  );
}

function KeyboardPreview() {
  const keyboard = useKeyboard();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("keyboard") === "1") {
      keyboard.show();
    }
  }, [keyboard]);

  return null;
}
