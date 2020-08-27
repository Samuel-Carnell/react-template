import React from 'react';
import App from './app';

export default {
	title: 'Application',
	component: App
};

export const Default = (): JSX.Element => {
	return <App name={'My Awesome Application'} />;
};
