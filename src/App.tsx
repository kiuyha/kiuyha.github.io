import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { useData } from "./contexts/DataContext";
import { useEffect, useMemo } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Background from "./components/Background";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ErrorPage from "./pages/ErrorPage";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Achievements from "./pages/Achievements";
import Contributions from "./pages/Contributions";
import Articles from "./pages/Articles";

// for route management
export default function App() {
	return (
		<Routes>
			<Route path="/" element={<InitialRedirector />} />
			<Route path="/:lang" element={<LanguageLayout />}>
				<Route index element={<Profile />} />
				<Route path="achievements" element={<Achievements />} />
				<Route path="contributions" element={<Contributions />} />
				<Route path="articles" element={<Articles />} />
				<Route
					path="*"
					element={
						<ErrorPage
							error={new Error("Page not found")}
							errorCode="404"
						/>
					}
				/>
			</Route>
		</Routes>
	);
}

// redirect to the first supported language
function InitialRedirector() {
	const { supportedLangs } = useData();

	// since it still being fetched, show loading screen
	if (supportedLangs.length === 0) return <LoadingScreen />;

	const userLang = navigator.language.split("-")[0];
	const langToRedirect =
		supportedLangs.find((l) => l.code === userLang)?.code ||
		supportedLangs[0].code;

	return <Navigate to={`/${langToRedirect}`} replace />;
}

// handle language change
function LanguageLayout() {
	const { lang } = useParams();
	const { supportedLangs, loadContentForLang, isLoading } = useData();
	const isLangSupported = useMemo(() => {
		if (supportedLangs.length === 0) return null;
		return supportedLangs.some((l) => l.code === lang);
	}, [lang, supportedLangs]);

	useEffect(() => {
		if (lang && isLangSupported) {
			loadContentForLang(lang);
		}
	}, [lang, supportedLangs]);

	// show error page
	if (isLangSupported === false) {
		return (
			<ErrorPage
				error={new Error("Unsupported language")}
				errorCode="404"
			/>
		);
	}

	// show loading screen
	if (isLoading) return <LoadingScreen />;

	return (
		<div className="relative min-h-screen text-black dark:text-white">
			<Background />
			<Header />
			<main className="pt-25 pb-8 px-3 md:px-8">
				<Outlet />
			</main>
			<NavBar />
			<Footer />
		</div>
	);
}
