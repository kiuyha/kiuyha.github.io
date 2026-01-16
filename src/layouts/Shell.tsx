import { type ReactNode } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import Background from "../components/Background";
import { DataProvider, type Data } from "../contexts/DataContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function Shell({ initialData }: { initialData: Data }) {
	return (
		<ThemeProvider>
			<DataProvider initialData={initialData}>
				<Background />
				<Header />
				<NavBar />
			</DataProvider>
		</ThemeProvider>
	);
}
