import React from 'react';
import Logo from 'assets/logo.svg'
import styles from './app.styles.css';
import './app.css';

function App(): JSX.Element {
	const a = true;
	return (
		<div className={styles.app}>
			<header className={styles.appHeader}>
				<Logo className={styles.appLogo} />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;