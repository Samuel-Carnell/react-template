import React from 'react';
import Logo from 'assets/logo.svg'
import styles from './app.styles.css';
import './app.css';

type AppProps = {
	name: string;
};

function App(props: AppProps): JSX.Element {
	return (
		<div className={styles.app}>
			<div className="flex flex-col md:flex-row">
				<Logo className={styles.appLogo} />
				<div className="text-center px-4 md:text-left md:px-0">
					<h1 id="app-name" className="font-light mt-4 text-4xl md:text-5xl">{props.name}</h1>
					<p>
						Edit <code>app/App.tsx</code> and save to reload.
					</p>
				</div>
			</div>
		</div>
	);
}

export default App;