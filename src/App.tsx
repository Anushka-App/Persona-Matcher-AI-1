import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PopupProvider } from "@/contexts/PopupContext";
import { UserProvider } from "@/contexts/UserContext";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import HomePage1 from "@/components/HomePage1";
import HeroSectionStandalone from "@/components/HeroSectionStandalone";
import CirclePage from "@/components/CirclePage";

import PersonalityQuiz from "@/components/PersonalityQuiz";
import PersonalityQuizResultPage from "@/components/PersonalityQuizResultPage";
import SubscribePage from "@/components/SubscribePage";
import ImageUploadPage from "@/components/ImageUploadPage";
import TextResultsPage from "@/components/TextResultsPage";
import ImageResultsPage from "@/components/ImageResultsPage";
import ARVRPage from "@/components/ARVRPage";
import ReportPage from "@/components/ReportPage";
import PersonalityOnlyReportPage from "@/components/PersonalityOnlyReportPage";
import UploadReportPage from "@/components/UploadReportPage";

import AdaptivePersonalityQuiz from "@/components/AdaptivePersonalityQuiz";
import ArtworkSelectionFlow from "@/components/ArtworkSelectionFlow";
import ChatPage from "./components/ChatPage";
import ProfilePage from "./components/ProfilePage";
import AdminDashboard from "./components/AdminDashboard";
import SignInPage from "./components/SignInPage";
import CreateAccountPage from "./components/CreateAccountPage";
import UploadQuestionsPage from "@/components/UploadQuestionsPage";
import AmbassadorPage from "@/components/AmbassadorPage";
import IconAwards from "@/components/IconAwards";
import ReferralProgram from "@/components/ReferralProgram";


// Error Boundary Component
const ErrorBoundary = () => (
  <div className="min-h-screen bg-palo-background flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">🎭</div>
      <h1 className="text-2xl font-bold text-palo-primary mb-4">Oops! Something went wrong</h1>
      <p className="text-muted-foreground mb-6">
        We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-palo-primary hover:bg-palo-accent text-white px-6 py-3 rounded-full transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

// 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen bg-palo-background flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-palo-primary mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist. Please check the URL or navigate back to the home page.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-palo-primary hover:bg-palo-accent text-white px-6 py-3 rounded-full transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

const Layout = () => (
  <div className="min-h-screen bg-palo-background">
    <Navigation />
    <Outlet />
  </div>
);

const LayoutWithoutHeader = () => (
  <div className="min-h-screen bg-palo-background">
    <Outlet />
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<Layout />} errorElement={<ErrorBoundary />}>
        <Route path="/home1" element={<HomePage1 />} />

        <Route path="/subscribe" element={<SubscribePage />} />
        <Route path="/arvr" element={<ARVRPage />} />
        <Route path="/report" element={<ReportPage />} />

        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />

      </Route>
      <Route element={<LayoutWithoutHeader />} errorElement={<ErrorBoundary />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/personality-quiz" element={<AdaptivePersonalityQuiz />} />
        <Route path="/personality-quiz-result" element={<PersonalityQuizResultPage />} />
        <Route path="/artwork-selection" element={<ArtworkSelectionFlow />} />
        <Route path="/personality-report" element={<PersonalityOnlyReportPage />} />
        <Route path="/results/text" element={<TextResultsPage />} />
        <Route path="/results/image" element={<ImageResultsPage />} />
        <Route path="/circle" element={<CirclePage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/hero-standalone" element={<HeroSectionStandalone />} />
        <Route path="/upload" element={<ImageUploadPage />} />
        <Route path="/upload/questions" element={<UploadQuestionsPage />} />
        <Route path="/upload-report" element={<UploadReportPage />} />
        <Route path="/ambassador" element={<AmbassadorPage />} />
        <Route path="/icon" element={<IconAwards />} />
        <Route path="/referral" element={<ReferralProgram />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </>
  )
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="anuschka-ui-theme">
      <UserProvider>
        <PopupProvider>
          <RouterProvider router={router} />
        </PopupProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;