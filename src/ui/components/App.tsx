import React, { ReactNode, useEffect, createContext } from "react";
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux";
import useAuth0 from "ui/utils/useAuth0";

import AppErrors from "./shared/Error";
import LoginModal from "./shared/LoginModal";
import SharingModal from "./shared/SharingModal";
import LaunchBrowserModal from "./shared/LaunchBrowserModal";
import NewWorkspaceModal from "./shared/NewWorkspaceModal";
import WorkspaceSettingsModal from "./shared/WorkspaceSettingsModal";
import UserSettingsModal from "./shared/UserSettingsModal";
import OnboardingModal from "./shared/OnboardingModal/index";
import { getSystemColorSchemePreference, isTest } from "ui/utils/environment";
import * as selectors from "ui/reducers/app";
import { getQuickOpenEnabled } from "devtools/client/debugger/src/selectors";
import { UIState } from "ui/state";
import { AppTheme, ModalType } from "ui/state/app";
import { Nag, useGetUserInfo } from "ui/hooks/users";

import LoadingScreen from "./shared/LoadingScreen";
import FirstReplayModal from "./shared/FirstReplayModal";
import TOSScreen, { LATEST_TOS_VERSION } from "./TOSScreen";
import SingleInviteModal from "./shared/OnboardingModal/SingleInviteModal";
import FocusModal from "./shared/FocusModal/FocusModal";
import { ConfirmRenderer } from "./shared/Confirm";
import PrivacyModal from "./shared/PrivacyModal";
import LoomModal from "./shared/LoomModal";
import NewAttachment from "./shared/NewAttachment";
import DownloadReplayPromptModal from "./shared/OnboardingModal/DownloadReplayPromptModal";
import QuickOpenModal from "devtools/client/debugger/src/components/QuickOpenModal";
import hooks from "ui/hooks";
import { shouldShowNag } from "ui/utils/user";
import { trackEvent } from "ui/utils/telemetry";
import SourcemapSetupModal from "./shared/Modals/SourcemapSetupModal";
import RenameReplayModal from "./shared/Modals/RenameReplayModal";
import { updateTheme } from "ui/actions/app";

function AppModal({ modal }: { modal: ModalType }) {
  const loadingFinished = useSelector(selectors.getLoadingFinished);

  if (!loadingFinished) {
    return null;
  }

  switch (modal) {
    case "sharing": {
      return <SharingModal />;
    }
    case "login": {
      return <LoginModal />;
    }
    case "settings": {
      return <UserSettingsModal />;
    }
    case "new-workspace": {
      return <NewWorkspaceModal />;
    }
    case "workspace-settings": {
      return <WorkspaceSettingsModal />;
    }
    case "onboarding": {
      return <OnboardingModal />;
    }
    case "single-invite": {
      return <SingleInviteModal />;
    }
    case "browser-launch": {
      return <LaunchBrowserModal />;
    }
    case "first-replay": {
      return <FirstReplayModal />;
    }
    case "download-replay": {
      return <DownloadReplayPromptModal />;
    }
    case "focusing": {
      return <FocusModal />;
    }
    case "privacy": {
      return <PrivacyModal />;
    }
    case "loom": {
      return <LoomModal />;
    }
    case "attachment": {
      return <NewAttachment />;
    }
    case "sourcemap-setup": {
      return <SourcemapSetupModal />;
    }
    case "rename-replay": {
      return <RenameReplayModal />;
    }
    default: {
      return null;
    }
  }
}

function App({ children, modal, quickOpenEnabled }: AppProps) {
  const auth = useAuth0();
  const dismissNag = hooks.useDismissNag();
  const userInfo = useGetUserInfo();
  const theme = useSelector(selectors.getTheme);

  useEffect(() => {
    if (userInfo.nags && shouldShowNag(userInfo.nags, Nag.FIRST_LOG_IN)) {
      trackEvent("login.first_log_in");
      dismissNag(Nag.FIRST_LOG_IN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo.nags]);

  useEffect(() => {
    // Stop space bar from being used as a universal "scroll down" operator
    // We have a big play/pause interface, so space makes way more sense for that.

    const stopCodeMirrorScroll = (e: KeyboardEvent) => {
      if (e.code !== "Space") {
        return;
      }

      if (
        e.target === document.body ||
        (e.target?.hasOwnProperty("classList") &&
          (e.target as Element).classList.contains(".CodeMirror-scroll"))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", stopCodeMirrorScroll);
    return () => window.removeEventListener("keydown", stopCodeMirrorScroll);
  }, []);

  useEffect(() => {
    document.body.parentElement!.className = `theme-${theme}`;
  }, [theme]);

  if (auth.isLoading || userInfo.loading) {
    return <LoadingScreen />;
  }

  if (
    !isTest() &&
    auth.isAuthenticated &&
    userInfo.acceptedTOSVersion &&
    userInfo.acceptedTOSVersion !== LATEST_TOS_VERSION
  ) {
    return <TOSScreen />;
  }

  return (
    <div id="app-container">
      {children}
      {modal ? <AppModal modal={modal} /> : null}
      {quickOpenEnabled === true && <QuickOpenModal />}
      <ConfirmRenderer />
      <AppErrors />
    </div>
  );
}

const connector = connect((state: UIState) => ({
  modal: selectors.getModal(state),
  // Only read quick open state if it exists, to ensure safe loads
  quickOpenEnabled: !!state.quickOpen && getQuickOpenEnabled(state),
}));
export type AppProps = ConnectedProps<typeof connector> & { children: ReactNode };

export default connector(App);
