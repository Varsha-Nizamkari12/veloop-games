import {
  Component,
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import ErrorState from "./components/ui/ErrorState";
import LoadingState from "./components/ui/LoadingState";

const GamesPage = lazy(
  () => import("./pages/GamesPage")
);

const BlockCrushPage = lazy(
  () => import("./pages/BlockCrushPage")
);

const BlockCrushGame = lazy(
  () => import("./pages/BlockCrushGame")
);

const MergeMasterPage = lazy(
  () => import("./pages/MergeMasterPage")
);

const MergeMasterGame = lazy(
  () => import("./pages/MergeMasterGame")
);

const RedeemPage = lazy(
  () => import("./pages/RedeemPage")
);

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    console.error(
      "VELOOP application error:",
      error
    );
  }

  handleRetry = () => {
    window.location.reload();
  };

  handleBack = () => {
    window.location.href = "/games";
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="We couldn't load this part of VELOOP."
          onRetry={this.handleRetry}
          onBack={this.handleBack}
        />
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <Suspense
          fallback={
            <LoadingState
              message="Loading VELOOP..."
            />
          }
        >
          <Routes>
            <Route
              path="/"
              element={<GamesPage />}
            />

            <Route
              path="/games"
              element={<GamesPage />}
            />

            <Route
              path="/games/block-crush"
              element={<BlockCrushPage />}
            />

            <Route
              path="/games/block-crush/play"
              element={<BlockCrushGame />}
            />

            <Route
              path="/games/merge-master"
              element={<MergeMasterPage />}
            />

            <Route
              path="/games/merge-master/play"
              element={<MergeMasterGame />}
            />

            <Route
              path="/redeem"
              element={<RedeemPage />}
            />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;